import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Repair from "@/models/repairs";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    // Filtros opcionales
    const filters: any = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    // Obtener las reparaciones con populate para incluir datos del cliente
    const repairs = await Repair.find(filters).populate(
      "customerId",
      "fullname email"
    );

    // Transformar las fechas de las reparaciones y de la línea de tiempo
    const transformedRepairs = repairs.map((repair) => ({
      ...repair.toObject(), // Convertimos el documento de mongoose a objeto plano
      createdAt:
        repair.createdAt instanceof Date
          ? repair.createdAt
          : new Date(repair.createdAt),
      updatedAt:
        repair.updatedAt instanceof Date
          ? repair.updatedAt
          : new Date(repair.updatedAt),
      timeline: repair.timeline.map((t) => ({
        ...t,
        timestamp:
          t.timestamp instanceof Date ? t.timestamp : new Date(t.timestamp),
      })),
    }));

    return NextResponse.json(transformedRepairs, { status: 200 });
  } catch (error) {
    console.error("Error fetching repairs:", error);
    return NextResponse.json(
      { message: "Error fetching repairs", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const { repairCode, title, status, priority, customerId, device } = body;

    if (!repairCode || !title || !customerId || !device) {
      return NextResponse.json(
        { message: "RepairCode, title, customerId, and device are required" },
        { status: 400 }
      );
    }

    const repair = await Repair.create({
      repairCode,
      title,
      status: status || "Pending",
      priority: priority || "Medium",
      customerId,
      device,
      timeline: [{ status: status || "Pending", note: "Repair created" }],
    });

    return NextResponse.json(
      { message: "Repair created successfully", repair },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating repair:", error);
    return NextResponse.json(
      { message: "Error creating repair", error: error.message },
      { status: 500 }
    );
  }
}
