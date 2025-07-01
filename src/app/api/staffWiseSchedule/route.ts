import connection from "@/DB/connection";
import AuthCheck from "@/middleware/AuthCheck";
import scheduleModel from "../../../../model/scheduleSchema";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connection();
    const res = await AuthCheck(req.headers.get("authorization") as string);
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    if (
      typeof res == "object" &&
      "role" in res &&
      (res?.role == "admin" || res?.role == "staff")
    ) {
      const schedule = await scheduleModel.find({
        staff: staffId,
      });

      return NextResponse.json(schedule);
    } else {
      return NextResponse.json({ status: 401, message: "Token Expired" });
    }
  } catch (error) {
    console.log(error);
  }
}
