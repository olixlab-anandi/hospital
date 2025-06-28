import connection from "@/DB/connection";
import adminSchema from "../../../../../model/adminSchema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const { otp, email } = await req.json();
    const user = await adminSchema.findOne({ email, otp });
    if (user) {
      await adminSchema.findOneAndUpdate({ email }, { otp: "" });
      return NextResponse.json({
        success: true,
        message: "OTP verified Successfully",
      });
    } else {
      return NextResponse.json({ success: false, message: "Enter Valid OTP" });
    }
  } catch (error) {
    console.log(error);
  }
}
