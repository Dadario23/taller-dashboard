import { NextResponse } from "next/server";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = params.id;
    const user = await User.findById(userId).select("-password"); // Excluir la contraseña

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);

    // Verifica si el error es una instancia de Error antes de acceder a la propiedad message
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Failed to fetch user", error: error.message },
        { status: 500 }
      );
    } else {
      // Si el error no es una instancia de Error, devuelve un mensaje genérico
      return NextResponse.json(
        { message: "Failed to fetch user", error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = params.id;
    const body = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullname: body.fullname,
        whatsapp: body.whatsapp,
        country: body.country,
        state: body.state,
        locality: body.locality,
        postalcode: body.postalcode,
        address: body.address,
      },
      { new: true } // Devuelve el documento actualizado
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user profile:", error);
    // Verifica si el error es una instancia de Error antes de acceder a la propiedad message
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Failed to fetch user", error: error.message },
        { status: 500 }
      );
    } else {
      // Si el error no es una instancia de Error, devuelve un mensaje genérico
      return NextResponse.json(
        { message: "Failed to fetch user", error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
