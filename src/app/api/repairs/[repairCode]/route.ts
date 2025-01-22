import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Repair from "@/models/repairs";
import User from "@/models/user";

export async function GET(
  req: Request,
  { params }: { params: { repairCode: string } }
) {
  try {
    await connectDB();

    const { repairCode } = params;
    const repair = await Repair.findOne({ repairCode }).populate(
      "customerId",
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
    console.error("Error fetching repair:", error);
    return NextResponse.json(
      { message: "Error fetching repair", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { repairCode: string } }
) {
  try {
    await connectDB();

    const { repairCode } = params;
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

    // Actualizar el timeline con el nuevo estado
    repair.timeline.push({
      status,
      timestamp: new Date(),
      note,
      changedBy,
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
    console.error("Error updating repair:", error);
    return NextResponse.json(
      { message: "Error updating repair", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { repairCode: string } }
) {
  try {
    await connectDB();

    const { repairCode } = params;

    const repair = await Repair.findOneAndDelete({ repairCode });

    if (!repair) {
      return NextResponse.json(
        { message: "Repair not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Repair deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting repair:", error);
    return NextResponse.json(
      { message: "Error deleting repair", error: error.message },
      { status: 500 }
    );
  }
}
