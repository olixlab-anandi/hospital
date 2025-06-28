import { NextResponse } from "next/server";
import scheduleModel from "../../../../model/scheduleSchema";
import connection from "@/DB/connection";

export async function POST(req: Request) {
  try {
    await connection();

    const todayDate = new Date();
    todayDate.setDate(todayDate.getDate() - 1);
    const prevDate = todayDate.toISOString().split("T")[0];
    const schedules = await scheduleModel.find({
      Date: prevDate,
      Status: { $ne: "Completed" },
    });
    console.log(prevDate, "today", new Date().toISOString().split("T")[0]);
    const carryForwardSchedules = schedules?.map((s) => {
      const scheduleObj = s.toObject();
      scheduleObj.Date = new Date().toISOString().split("T")[0];
      scheduleObj._id = undefined;
      return scheduleObj;
    });

    await scheduleModel.insertMany(carryForwardSchedules);

    return NextResponse.json({ carryForwardSchedules });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error });
  }
}
