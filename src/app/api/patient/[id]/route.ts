import { NextRequest, NextResponse } from "next/server";
import AuthCheck from "@/middleware/AuthCheck";
import connection from "@/DB/connection";
import patientModel from "../../../../../model/patientSchema";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }
    await connection();
    const token = req.headers.get("authorization");

    const res = await AuthCheck(token as string);

    if (
      typeof res == "object" &&
      "role" in res &&
      (res?.role == "admin" || res?.role == "staff")
    ) {
      const patient = await patientModel.findById(id);
      return NextResponse.json(patient);
    } else {
      return NextResponse.json(res);
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
