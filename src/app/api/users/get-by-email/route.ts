import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // Asegúrate de que este archivo existe
import User from "@/models/user"; // Modelo de usuario en Mongoose

export async function GET(req: Request) {
  await connectDB(); // Conectar a MongoDB

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { message: "El email es requerido" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ userId: user._id }); // Devolvemos el ID del usuario
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener el usuario", error },
      { status: 500 }
    );
  }
}
