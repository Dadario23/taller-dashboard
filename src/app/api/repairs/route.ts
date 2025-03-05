import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Repair from "@/models/repairs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Schema } from "mongoose";
interface TimelineEvent {
  status: string;
  previousStatus?: string;
  timestamp: Date;
  note?: string;
  changedBy: Schema.Types.ObjectId;
  roleAtChange: "admin" | "superadmin" | "technician" | "user" | "reception";
}

interface RepairFilters {
  status?: string;
  priority?: string;
  technician?: string;
  customer?: string;
  repairCode?: string;
}

interface Repair {
  repairCode: string;
  title: string;
  status: string;
  createdAt: Date;
  customer: {
    fullname: string;
    email: string;
  };
  device: {
    type: string;
    brand: string;
    model: string;
    flaw: string;
    physicalCondition: string;
    notes: string;
  };
}

// Definir un tipo para Technician
interface Technician {
  _id: string;
  fullname: string;
}

// Definir un tipo para Customer
interface Customer {
  _id: string;
  fullname: string;
  email: string;
}

// Definir un tipo para Device
interface Device {
  type: string;
  brand: string;
  model: string;
  flaw: string;
  physicalCondition: string;
  notes: string;
}

// Definir un tipo para PopulatedRepair
interface PopulatedRepair {
  repairCode: string;
  title: string;
  status: string;
  priority: string;
  device: Device;
  flaw: string;
  customer: Customer;
  receivedBy: string;
  technician: string | null;
  requiresCustomerApproval: boolean;
  timeline: TimelineEvent[];
  totalProcessingTimeHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: Request) {
  try {
    await connectDB(); // Conectar a la DB

    // Obtener parámetros de la URL
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const technician = searchParams.get("technician"); // Cambiado de technicianId → technician
    const customer = searchParams.get("customer"); // Cambiado de customerId → customer
    const repairCode = searchParams.get("repairCode");

    // Construir filtros dinámicos
    const filters: RepairFilters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (technician) filters.technician = technician; // Cambiado de technicianId → technician
    if (customer) filters.customer = customer; // Cambiado de customerId → customer
    if (repairCode) filters.repairCode = repairCode;

    await User.findOne(); // 👈 Esto fuerza a Mongoose a registrar `User` antes de `Repair`

    const repairs = await Repair.find(filters)
      .populate("customer", "fullname email") // Cambiado de customerId → customer
      .populate("technician", "fullname") // Cambiado de technicianId → technician
      .lean();

    const transformedRepairs = repairs.map((repair) => {
      // Verificar que `technician` esté correctamente poblado
      const technician = repair.technician as unknown as Technician;

      const transformedRepair = {
        ...repair,
        createdAt: new Date(repair.createdAt).toISOString(),
        updatedAt: new Date(repair.updatedAt).toISOString(),
        timeline: repair.timeline.map((t: TimelineEvent) => ({
          ...t,
          timestamp: new Date(t.timestamp).toISOString(),
        })),
        customer: repair.customer, // Ya no es necesario renombrar
        technician: technician
          ? {
              _id: technician._id.toString(), // Convertir ObjectId a string
              fullname: technician.fullname,
              waitingTimeHours: null, // No se aplica si el técnico está asignado
            }
          : {
              _id: null,
              fullname: null,
              waitingTimeHours: Math.max(
                0,
                Math.floor(
                  (Date.now() - new Date(repair.createdAt).getTime()) /
                    (1000 * 60 * 60)
                )
              ),
            },
      };

      return transformedRepair;
    });

    return NextResponse.json(transformedRepairs, { status: 200 });
  } catch (error) {
    console.error("Error fetching repairs:", error);
    return NextResponse.json(
      { message: "Error fetching repairs", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // Extraer datos del cuerpo de la solicitud
    const body = await req.json();
    console.log("Request body received:", body); // Verificar el cuerpo completo de la solicitud

    const {
      title,
      status = "Ingresado",
      priority,
      device,
      customer,
      receivedBy,
    } = body;

    // Extraer `notes` y `flaw` del objeto `device`
    const { notes, flaw } = device;
    console.log("Extracted notes from device:", notes); // Verificar el valor de `notes`
    console.log("Extracted flaw from device:", flaw); // Verificar el valor de `flaw`

    if (!customer) {
      return NextResponse.json(
        { message: "customer is required" },
        { status: 400 }
      );
    }

    if (!receivedBy) {
      return NextResponse.json(
        { message: "receivedBy is required" },
        { status: 400 }
      );
    }

    // 🚀 Verificar el rol del usuario que crea la reparación
    const receivedByUser = await User.findById(receivedBy);
    if (
      !receivedByUser ||
      !["reception", "admin", "superadmin"].includes(receivedByUser.role)
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthorized. Only reception, admin, or superadmin can create repairs.",
        },
        { status: 403 }
      );
    }

    // 🚀 Generar `repairCode` basado en el número de reparaciones
    const repairCount = await Repair.countDocuments();
    const repairCode = `TASK-${1000 + repairCount + 1}`;

    // ✅ Corrección: Si el desperfecto es "Diagnosticar por el técnico" o "No enciende", requiere aprobación del cliente
    const normalizedFlaw = flaw ? flaw.trim().toLowerCase() : "";
    console.log("Normalized flaw:", normalizedFlaw); // Verificar el valor normalizado de `flaw`

    const requiresCustomerApproval = [
      "diagnosticar por el tecnico",
      "no enciende",
    ].includes(normalizedFlaw);

    const deviceData = {
      ...device,
      brand: device.brand,
      model: device.brand === "Sin especificar" ? "" : device.model,
      physicalCondition: device?.physicalCondition?.trim() || null,
      notes: notes || "",
    };

    console.log("Device data with notes:", deviceData); // Verificar el objeto `deviceData`

    // ✅ Corrección del `timeline`
    const initialTimeline = [
      {
        status: "Ingresado",
        timestamp: new Date(),
        note: "Reparación creada.",
        changedBy: receivedBy,
        roleAtChange: receivedByUser.role,
      },
    ];

    const newRepair = new Repair({
      repairCode,
      title,
      status,
      priority,
      device: deviceData, // Usar `deviceData` que ya incluye `notes`
      flaw: normalizedFlaw,
      customer, // Cambiado de customerId → customer
      receivedBy,
      technician: null, // Cambiado de technicianId → technician
      requiresCustomerApproval,
      timeline: initialTimeline,
      totalProcessingTimeHours: 1,
    });

    console.log("New repair object before saving:", newRepair); // Verificar el objeto `newRepair`

    await newRepair.save();

    console.log("Repair saved successfully:", newRepair); // Verificar la reparación guardada

    // Poblar el campo `customer` con los datos del cliente
    const populatedRepair = (await Repair.findOne({ repairCode })
      .populate("customer", "fullname email") // Popula solo fullname y email
      .populate("device") // Popula si `device` también es una referencia
      .exec()) as unknown as PopulatedRepair;

    if (!populatedRepair) {
      return NextResponse.json(
        { message: "Reparación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que `customer` está poblado correctamente
    if (
      !populatedRepair.customer ||
      !("fullname" in populatedRepair.customer)
    ) {
      return NextResponse.json(
        { message: "Error al obtener los datos del cliente" },
        { status: 500 }
      );
    }

    // 🚀 Generar el PDF con los datos de la reparación
    const pdfBuffer = await generatePDF(populatedRepair);

    // Devolver el PDF como respuesta para descargar
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=ticket-${repairCode}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error creating repair:", error);
    return NextResponse.json(
      { message: "Error creating repair", error: (error as Error).message },
      { status: 500 }
    );
  }
}

async function generatePDF(repair: Repair) {
  // Crear un nuevo documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([170, 300]); // Tamaño ajustado para impresoras térmicas

  // Cargar las fuentes necesarias
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Configurar estilos
  const fontSize = 10;
  const lineHeight = 12;
  let y = page.getHeight() - 20; // Empezar desde la parte superior

  // Función para agregar texto al PDF
  const addText = (text: string, x: number, y: number, bold = false) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font: bold ? boldFont : font, // Usar la fuente en negrita si es necesario
      color: rgb(0, 0, 0),
    });
  };

  // Encabezado del ticket
  addText("TICKET DE REPARACIÓN", 10, y, true);
  y -= lineHeight;
  addText("-----------------------------", 10, y);
  y -= lineHeight;

  // Información de la reparación
  addText(`Código: ${repair.repairCode}`, 10, y);
  y -= lineHeight;
  addText(`Título: ${repair.title}`, 10, y);
  y -= lineHeight;
  addText(`Estado: ${repair.status}`, 10, y);
  y -= lineHeight;
  addText("-----------------------------", 10, y);
  y -= lineHeight;

  // Información del cliente
  addText("Cliente:", 10, y, true);
  y -= lineHeight;
  addText(`- ${repair.customer.fullname}`, 15, y);
  y -= lineHeight;
  addText(`- ${repair.customer.email}`, 15, y);
  y -= lineHeight;
  addText("-----------------------------", 10, y);
  y -= lineHeight;

  // Información del dispositivo
  addText("Dispositivo:", 10, y, true);
  y -= lineHeight;
  addText(`- Tipo: ${repair.device.type}`, 15, y);
  y -= lineHeight;
  addText(`- Marca: ${repair.device.brand}`, 15, y);
  y -= lineHeight;
  addText(`- Modelo: ${repair.device.model}`, 15, y);
  y -= lineHeight;
  addText(`- Desperfecto: ${repair.device.flaw}`, 15, y);
  y -= lineHeight;
  addText(`- Condicion: ${repair.device.physicalCondition}`, 15, y);
  y -= lineHeight;
  addText(`- Observaciones: ${repair.device.notes}`, 15, y);
  y -= lineHeight;
  addText("-----------------------------", 10, y);
  y -= lineHeight;

  // Fecha de creación
  addText(`Fecha: ${repair.createdAt.toLocaleDateString()}`, 10, y);
  y -= lineHeight;

  // Pie de página
  addText("Gracias por confiar en nosotros", 10, y);
  y -= lineHeight;
  addText("www.tureparacion.com", 10, y);

  // Guardar el PDF en un buffer
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
