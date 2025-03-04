import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import nodemailer from "nodemailer";
import Repair from "@/models/repairs"; // Asegúrate de importar tu modelo de Repair
import { connectDB } from "@/lib/mongodb"; // Función para conectar a la base de datos

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Definir tipos para TypeScript
interface Customer {
  _id: string;
  fullname: string;
  email: string;
}

interface Repair {
  repairCode: string;
  title: string;
  status: string;
  priority: string;
  device: {
    type: string;
    brand: string;
    model: string;
    flaw: string;
    notes?: string; // Hacer notes opcional
  };
  customer: Customer;
  createdAt: Date;
}

// Función para generar el PDF
async function generatePDF(repair: Repair) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  // Configurar fuentes y estilos
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = 15;
  let y = 750;

  // Función para agregar texto al PDF
  const addText = (text: string, x: number, y: number) => {
    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
  };

  // Agregar los datos de la reparación al PDF
  addText(`Código de reparación: ${repair.repairCode}`, 50, y);
  y -= lineHeight;
  addText(`Título: ${repair.title}`, 50, y);
  y -= lineHeight;
  addText(`Estado: ${repair.status}`, 50, y);
  y -= lineHeight;
  addText(`Prioridad: ${repair.priority}`, 50, y);
  y -= lineHeight;
  addText(`Dispositivo: ${repair.device.type}`, 50, y);
  y -= lineHeight;
  addText(`Marca: ${repair.device.brand}`, 50, y);
  y -= lineHeight;
  addText(`Modelo: ${repair.device.model}`, 50, y);
  y -= lineHeight;
  addText(`Desperfecto: ${repair.device.flaw}`, 50, y);
  y -= lineHeight;
  addText(`Observaciones: ${repair.device.notes || "N/A"}`, 50, y);
  y -= lineHeight;
  addText(`Cliente: ${repair.customer.fullname}`, 50, y);
  y -= lineHeight;
  addText(`Correo: ${repair.customer.email}`, 50, y);
  y -= lineHeight;
  addText(`Fecha de creación: ${repair.createdAt.toLocaleDateString()}`, 50, y);

  // Guardar el PDF en un buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes); // Convertir Uint8Array a Buffer
}

// Función para enviar el correo electrónico
async function sendEmail(
  to: string,
  subject: string,
  text: string,
  pdfBuffer: Buffer
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    attachments: [
      {
        filename: `ticket-${subject}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

// Endpoint principal
export async function POST(req: Request) {
  try {
    await connectDB(); // Conectar a la base de datos

    const { repairId, email } = await req.json();

    // Buscar la reparación en la base de datos
    const repair = await Repair.findById(repairId).populate<{
      customer: Customer;
    }>("customer");
    if (!repair) {
      return NextResponse.json(
        { message: "Reparación no encontrada" },
        { status: 404 }
      );
    }

    // Generar el PDF con los datos de la reparación
    const pdfBuffer = await generatePDF(repair);

    // Enviar el PDF por correo electrónico
    await sendEmail(
      email,
      `Ticket de reparación - ${repair.repairCode}`,
      `Hola ${repair.customer.fullname}, adjuntamos tu ticket de reparación.`,
      pdfBuffer
    );

    return NextResponse.json(
      { message: "Ticket enviado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generando el ticket:", error);
    return NextResponse.json(
      {
        message: "Error generando el ticket",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
