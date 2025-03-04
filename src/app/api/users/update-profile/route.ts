import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar que el usuario sea administrador
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    console.log("Request Body in Backend:", body);
    const {
      email, // Email único para identificar al usuario
      fullname,
      country,
      state,
      locality,
      address,
      postalcode,
      whatsapp,
      avatar,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    // Buscar al usuario por su email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Actualizar los campos del perfil
    user.fullname = fullname || user.fullname;
    user.country = country || user.country;
    user.state = state || user.state;
    user.locality = locality || user.locality;
    user.address = address || user.address;
    user.postalcode = postalcode || user.postalcode;
    user.whatsapp = whatsapp || user.whatsapp;
    user.image = avatar || user.image;

    await user.save();

    return NextResponse.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
