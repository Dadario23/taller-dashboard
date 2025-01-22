import { NextResponse } from "next/server";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";

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
    return NextResponse.json(
      { message: "Failed to update profile", error: error.message },
      { status: 500 }
    );
  }
}
