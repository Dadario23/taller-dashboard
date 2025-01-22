import User from "@/models/user";
import { NextResponse } from "next/server";
import bcript from "bcryptjs";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: Request) {
  const { fullname, password, email } = await request.json();
  console.log(fullname, password, email);

  if (!password || password.length < 6) {
    return NextResponse.json(
      {
        message: "Password most be least 6  characters",
      },
      {
        status: 400,
      }
    );
  }

  try {
    await connectDB();

    const userFound = await User.findOne({ email });
    if (userFound)
      return NextResponse.json(
        { message: "Email already exists" },
        {
          status: 409,
        }
      );

    const hashedPassword = await bcript.hash(password, 12);

    const user = new User({
      email,
      fullname,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    console.log(savedUser);

    return NextResponse.json({
      _id: savedUser._id,
      email: savedUser.email,
      fullname: savedUser.fullname,
    });
  } catch (error) {
    console.log(error);
  }
}
