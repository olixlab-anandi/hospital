import AuthCheck from "@/middleware/AuthCheck";
import AdminStaff from "../../../../../model/adminSchema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import connection from "@/DB/connection";

export async function POST(req: Request) {
  try {
    await connection();
    const token = req.headers.get("authorization");
    const res = await AuthCheck(token as string);

    if (typeof res == "object" && "email" in res) {
      const data = await req.json();
      const hashedPass = await bcrypt.hash(data.password, 10);
      const staff = await AdminStaff.findOneAndUpdate(
        { email: res.email },
        { $set: { password: hashedPass } },
        { new: true }
      );
      console.log("staff================", staff);
      return NextResponse.json({
        success: true,
        message: "Password Reset",
        role: res.role,
      });
    } else {
      return NextResponse.json(res);
    }
  } catch (error) {
    console.log(error);
  }
}
