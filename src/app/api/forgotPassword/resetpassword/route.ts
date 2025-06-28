import connection from "@/DB/connection";
import adminSchema from "../../../../../model/adminSchema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const { email, password } = await req.json();

    const user = await adminSchema.findOne({ email });

    if (user) {
      const hashedPass = await bcrypt.hash(password, 10);
      await adminSchema.findOneAndUpdate({ email }, { password: hashedPass });
      return NextResponse.json({
        success: true,
        message: "password Updated Succesfully",
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "password is not updated",
      });
    }
  } catch (error) {
    console.log(error);
  }
}
