import { NextResponse } from "next/server";
import scheduleModel from "../../../../model/scheduleSchema";
import connection from "@/DB/connection";

export async function GET() {
  try {
    await connection();

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // 1. Get all patients with pending schedules (who have future sessions)
    const patientsWithSchedules = await scheduleModel
      .find({
        Status: { $nin: ["Completed", "Canceled"] },
      })
      .distinct("patient"); // Only get unique patient IDs

    const carryForwardSchedules = [];

    for (const patientId of patientsWithSchedules) {
      // 2. Get latest schedule for the patient
      const lastSchedule = await scheduleModel
        .findOneAndUpdate(
          { patient: patientId },
          {
            createdAt: new Date(),
          },
          { new: true }
        )
        .sort({ Date: -1 });

      if (!lastSchedule) continue;

      const lastDate = new Date(lastSchedule.Date);
      const frequency = lastSchedule.sessionFrequencyInDays || 1;

      const dayGap = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 3. Check if gap is enough AND no schedule for today exists
      const alreadyScheduledToday = await scheduleModel.findOne({
        patient: patientId,
        Date: todayStr,
      });

      if (dayGap >= frequency && !alreadyScheduledToday) {
        const scheduleObj = lastSchedule.toObject();
        scheduleObj.Date = todayStr;
        scheduleObj._id = undefined;
        carryForwardSchedules.push(scheduleObj);
      }
    }

    if (carryForwardSchedules.length > 0) {
      await scheduleModel.insertMany(carryForwardSchedules);
    }

    return NextResponse.json({ carryForwardSchedules });
  } catch (error) {
    console.error("Error carrying forward schedules:", error);
    return NextResponse.json({ error: "Failed to carry forward schedules" });
  }
}
