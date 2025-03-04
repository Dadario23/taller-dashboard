import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Repair from "@/models/repairs";
import User from "@/models/user";

export async function GET(
  req: Request,
  context: { params: { repairCode: string } }
) {
  try {
    await connectDB();

    const { repairCode } = context.params; // Corrección aquí
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
    console.error("Error fetching repair:", error);
    return NextResponse.json(
      { message: "Error fetching repair", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: { repairCode: string } }
) {
  try {
    await connectDB();

    const { repairCode } = context.params; // Corrección aquí
    const { status, note, changedBy } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

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

    const repair = await Repair.findOne({ repairCode });
    if (!repair) {
      return NextResponse.json(
        { message: "Repair not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(changedBy);
    if (!user || !["technician", "admin", "superadmin"].includes(user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to update this repair" },
        { status: 403 }
      );
    }

    if (status === "In Progress" && user.role !== "technician") {
      return NextResponse.json(
        { error: "Only technicians can set the status to 'In Progress'." },
        { status: 403 }
      );
    }

    const roleAtChange = user.role;
    repair.timeline.push({
      status,
      previousStatus: repair.status,
      timestamp: new Date(),
      note,
      changedBy,
      roleAtChange,
    });

    repair.status = status;
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

export async function PATCH(
  req: Request,
  context: { params: { repairCode: string } }
) {
  try {
    await connectDB();

    const { repairCode } = context.params; // Corrección aquí
    const { status, note, changedBy } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

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

    const repair = await Repair.findOne({ repairCode });
    if (!repair) {
      return NextResponse.json(
        { message: "Repair not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(changedBy);
    if (!user || !["technician", "admin", "superadmin"].includes(user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to update this repair" },
        { status: 403 }
      );
    }

    repair.timeline.push({
      status,
      timestamp: new Date(),
      note,
      changedBy,
    });

    repair.status = status;
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
  context: { params: { repairCode: string } }
) {
  try {
    await connectDB();

    const { repairCode } = context.params; // Corrección aquí
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
