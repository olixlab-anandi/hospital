import connection from "@/DB/connection";
import { NextResponse } from "next/server";
import adminSchema from "../../../../../model/adminSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  await connection();

  const { email, password } = await req.json();

  const user = await adminSchema.findOne({ email });
  if (!user) {
    return NextResponse.json({
      success: false,
      message: "Invalid credentials",
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.TOKEN_SECRETE as string,
    {
      expiresIn: "1h",
    }
  );
  return NextResponse.json({
    success: true,
    message: "Login Succesfully",
    role: user.role,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      flatNo: user.flatNo,
      area: user.area,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      sessionCharge: user.sessionCharge,
    },
    token,
  });
}
