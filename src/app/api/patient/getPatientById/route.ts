import { NextResponse } from "next/server";
import AuthCheck from "@/middleware/AuthCheck";
import connection from "@/DB/connection";
import patientModel from "../../../../../model/patientSchema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }
    await connection();
    const token = req.headers.get("authorization");

    const res = await AuthCheck(token as string);
    console.log("token", req.headers);
    if (
      typeof res == "object" &&
      "role" in res &&
      (res?.role == "admin" || res?.role == "staff")
    ) {
      const patient = await patientModel.findOne({ _id: id });
      return NextResponse.json(patient);
    } else {
      return NextResponse.json({
        status: 401,
        message: typeof res == "object" && res?.message,
      });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
