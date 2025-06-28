import connection from "@/DB/connection";
import { sendEmail } from "../../_utils/emailService";
import { NextResponse } from "next/server";
import adminSchema from "../../../../../model/adminSchema";

export async function POST(req: Request) {
  try {
    await connection();
    const { email } = await req.json();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendEmail({
      from: "olixlab.50@gmail.com",
      to: email,
      subject: "OTP verification",
      text: "otp varification email",
      html: `<h4>
            Your ONE TIME PASSWORD IS 
            <h1>${otp}</h1>
        <h4>`,
    });

    const user = await adminSchema.findOne({ email });
    if (user) {
      user.otp = otp;
    } else {
      return NextResponse.json({ seccess: false, message: "Email not Found" });
    }
    await user.save();
    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.log(error);
  }
}
