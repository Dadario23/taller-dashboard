import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find().select(
      "fullname email role status createdAt updatedAt whatsapp"
    );

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);

    // Verificar si `error` es una instancia de `Error`
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error fetching users", error: error.message },
        { status: 500 }
      );
    } else {
      // Si `error` no es una instancia de `Error`, devolver un mensaje genérico
      return NextResponse.json(
        { message: "Error fetching users", error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
