import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Repair from "@/models/repairs";
import User from "@/models/user";

// Función simulada para enviar notificaciones
const sendNotification = async (userId: string, message: string) => {
  const user = await User.findById(userId);
  if (user && user.email) {
    console.log(`Enviando notificación a ${user.email}: ${message}`);
    // Aquí podrías integrar un servicio de correo electrónico o mensajería
  }
};

// GET: Obtener una reparación por su código
export async function GET(
  req: Request,
  { params }: { params: Promise<{ repairCode: string }> } // Ajustado para coincidir con el tipo esperado
) {
  try {
    await connectDB();

    const { repairCode } = await params; // Usamos await para obtener los valores de params
    const repair = await Repair.findOne({ repairCode }).populate(
      "customer",
      "fullname email"
    );

    if (!repair) {
      return NextResponse.json(
        { message: "Repair not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(repair, { status: 200 });
  } catch (error) {
    // Verifica si el error es una instancia de Error antes de acceder a la propiedad message
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error fetching repair", error: error.message },
        { status: 500 }
      );
    } else {
      // Si el error no es una instancia de Error, devuelve un mensaje genérico
      return NextResponse.json(
        {
          message: "Error fetching repair",
          error: "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  }
}

// PUT: Actualizar el estado de una reparación
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ repairCode: string }> } // Ajustado para coincidir con el tipo esperado
) {
  try {
    await connectDB();

    const { repairCode } = await params; // Usamos await para obtener los valores de params
    const { status, note, changedBy } = await req.json(); // Obtén los datos del body

    // Validar que se proporcione un estado
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validar que el estado sea válido
    const validStatuses = [
      "Pending",
      "Under Review",
      "In Progress",
      "Ready for Pickup",
      "Delivered",
      "Cancelled",
      "Not Repairable",
      "Waiting for Customer Approval",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Allowed statuses are: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Buscar la reparación por su repairCode
    const repair = await Repair.findOne({ repairCode });

    if (!repair) {
      return NextResponse.json(
        { message: "Repair not found" },
        { status: 404 }
      );
    }

    // Validar si el usuario que realiza la actualización tiene permisos
    const user = await User.findById(changedBy);
    if (!user || !["technician", "admin", "superadmin"].includes(user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to update this repair" },
        { status: 403 }
      );
    }

    // Validar que solo los técnicos puedan cambiar el estado a "In Progress"
    if (status === "In Progress" && user.role !== "technician") {
      return NextResponse.json(
        { error: "Only technicians can set the status to 'In Progress'." },
        { status: 403 }
      );
    }

    // Obtener el rol del usuario que realiza el cambio
    const roleAtChange = user.role;

    // Actualizar el timeline con el nuevo estado
    repair.timeline.push({
      status,
      previousStatus: repair.status, // Guarda el estado anterior
      timestamp: new Date(),
      note,
      changedBy,
      roleAtChange, // Asegúrate de incluir el rol del usuario
    });

    // Actualizar el estado actual
    repair.status = status;

    // Guardar cambios
    await repair.save();

    // Enviar notificaciones
    await sendNotification(
      repair.customer.toString(), // Convertir ObjectId a string
      `El estado de tu reparación (${repair.repairCode}) ha cambiado a "${status}".`
    );
    if (repair.technician) {
      // Usar la propiedad correcta (technician en lugar de technicianId)
      await sendNotification(
        repair.technician.toString(), // Convertir ObjectId a string
        `El estado de la reparación (${repair.repairCode}) ha cambiado a "${status}".`
      );
    }

    return NextResponse.json(
      { message: "Repair status updated successfully", repair },
      { status: 200 }
    );
  } catch (error) {
    // Verifica si el error es una instancia de Error antes de acceder a la propiedad message
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error updating repair", error: error.message },
        { status: 500 }
      );
    } else {
      // Si el error no es una instancia de Error, devuelve un mensaje genérico
      return NextResponse.json(
        {
          message: "Error updating repair",
          error: "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  }
}

// PATCH: Actualizar parcialmente una reparación
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ repairCode: string }> } // Ajustado para coincidir con el tipo esperado
) {
  try {
    await connectDB();

    const { repairCode } = await params; // Usamos await para obtener los valores de params
    const { status, note, changedBy } = await req.json();

    // Validar que se proporcione un estado
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validar que el estado sea válido
    const validStatuses = [
      "Pending",
      "Under Review",
      "In Progress",
      "Ready for Pickup",
      "Delivered",
      "Cancelled",
      "Not Repairable",
      "Waiting for Customer Approval",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Allowed statuses are: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Buscar la reparación por su código
    const repair = await Repair.findOne({ repairCode });

    if (!repair) {
      return NextResponse.json(
        { message: "Repair not found" },
        { status: 404 }
      );
    }

    // Validar si el usuario que realiza la actualización tiene permisos
    const user = await User.findById(changedBy);
    if (!user || !["technician", "admin", "superadmin"].includes(user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to update this repair" },
        { status: 403 }
      );
    }

    // Obtener el rol del usuario que realiza el cambio
    const roleAtChange = user.role; // Asumiendo que `user` es el objeto del usuario que realiza la actualización

    // Actualizar el timeline con el nuevo estado
    repair.timeline.push({
      status,
      timestamp: new Date(),
      note,
      changedBy,
      roleAtChange, // Incluir la propiedad requerida
    });

    // Actualizar el estado actual
    repair.status = status;

    // Guardar cambios
    await repair.save();

    return NextResponse.json(
      { message: "Repair status updated successfully", repair },
      { status: 200 }
    );
  } catch (error) {
    // Verifica si el error es una instancia de Error antes de acceder a la propiedad message
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error updating repair", error: error.message },
        { status: 500 }
      );
    } else {
      // Si el error no es una instancia de Error, devuelve un mensaje genérico
      return NextResponse.json(
        {
          message: "Error updating repair",
          error: "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  }
}

// DELETE: Eliminar múltiples reparaciones
export async function DELETE(req: Request) {
  try {
    await connectDB();

    // Obtener la lista de repairCodes desde el cuerpo de la solicitud
    const { repairCodes } = await req.json();

    // Verificar si se proporcionaron repairCodes
    if (!repairCodes || !Array.isArray(repairCodes)) {
      return NextResponse.json(
        { message: "Invalid repairCodes provided" },
        { status: 400 }
      );
    }

    // Eliminar las reparaciones con los repairCodes proporcionados
    const deleteResult = await Repair.deleteMany({
      repairCode: { $in: repairCodes },
    });

    // Verificar si se eliminaron reparaciones
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { message: "No repairs found with the provided repairCodes" },
        { status: 404 }
      );
    }

    // Devolver una respuesta exitosa
    return NextResponse.json(
      {
        message: "Repairs deleted successfully",
        deletedCount: deleteResult.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    // Manejo de errores
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error deleting repairs", error: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        {
          message: "Error deleting repairs",
          error: "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  }
}
