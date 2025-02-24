import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Repair from "@/models/repairs";

export async function GET(req: Request) {
  try {
    await connectDB(); // Conectar a la DB

    // Obtener parámetros de la URL
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const technicianId = searchParams.get("technicianId");
    const customerId = searchParams.get("customerId");
    const repairCode = searchParams.get("repairCode");

    // Construir filtros dinámicos
    const filters: any = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (technicianId) filters.technicianId = technicianId;
    if (customerId) filters.customerId = customerId;
    if (repairCode) filters.repairCode = repairCode;

    await User.findOne(); // 👈 Esto fuerza a Mongoose a registrar `User` antes de `Repair`

    const repairs = await Repair.find(filters)
      .populate("customerId", "fullname email")
      .populate("technicianId", "fullname")
      .lean();

    const transformedRepairs = repairs.map((repair) => {
      const transformedRepair = {
        ...repair,
        createdAt: new Date(repair.createdAt).toISOString(),
        updatedAt: new Date(repair.updatedAt).toISOString(),
        timeline: repair.timeline.map((t) => ({
          ...t,
          timestamp: new Date(t.timestamp).toISOString(),
        })),
        customer: repair.customerId, // Renombramos customerId → customer
        technician: repair.technicianId
          ? {
              _id: repair.technicianId._id,
              fullname: repair.technicianId.fullname,
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

      // 🔹 Eliminar campos innecesarios
      delete transformedRepair.customerId;
      delete transformedRepair.technicianId; // Esto evita la duplicación

      return transformedRepair;
    });

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

    // Extraer datos del cuerpo de la solicitud
    const body = await req.json();
    console.log("Request body received:", body); // Verificar el cuerpo completo de la solicitud

    const {
      title,
      status = "Ingresado",
      priority,
      device,
      customerId,
      receivedBy,
    } = body;

    // Extraer `notes` del objeto `device`
    const { notes } = device;
    console.log("Extracted notes from device:", notes); // Verificar el valor de `notes`

    // Extraer `notes` del objeto `device`
    const { flaw } = device;
    console.log("Extracted notes from device:", notes); // Verificar el valor de `notes`

    if (!customerId) {
      return NextResponse.json(
        { message: "customerId is required" },
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

    // ✅ Corrección: Asegurar que `physicalCondition` sea `null` si no se envía
    const deviceData = {
      ...device,
      physicalCondition: device?.physicalCondition?.trim() || null, // Si es una cadena vacía, se convierte a null
      notes: notes || null, // Asignar `notes` al objeto `device`
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
      customerId,
      receivedBy,
      technicianId: null,
      requiresCustomerApproval,
      timeline: initialTimeline,
      totalProcessingTimeHours: 1,
    });

    console.log("New repair object before saving:", newRepair); // Verificar el objeto `newRepair`

    await newRepair.save();

    console.log("Repair saved successfully:", newRepair); // Verificar la reparación guardada

    return NextResponse.json(
      { message: "Repair created successfully", repair: newRepair },
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
