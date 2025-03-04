import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Repair from "@/models/repairs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    const repairs = await Repair.find({ customer: id });

    if (!repairs || repairs.length === 0) {
      return NextResponse.json(
        { message: "No repairs found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json(repairs, { status: 200 });
  } catch (error) {
    // Verifica si el error es una instancia de Error antes de acceder a la propiedad message
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error fetching user repairs", error: error.message },
        { status: 500 }
      );
    } else {
      // Si el error no es una instancia de Error, devuelve un mensaje genérico
      return NextResponse.json(
        {
          message: "Error fetching user repairs",
          error: "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  }
}
