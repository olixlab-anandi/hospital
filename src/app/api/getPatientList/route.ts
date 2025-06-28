import patientModel from "../../../../model/patientSchema";
import { NextResponse } from "next/server";
import scheduleModel from "../../../../model/scheduleSchema";
import connection from "@/DB/connection";
import AuthCheck from "@/middleware/AuthCheck";

export async function GET(req: Request) {
  try {
    await connection();
    const authRes = await AuthCheck(req.headers.get("authorization") as string);
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");
    if (
      typeof authRes == "object" &&
      "role" in authRes &&
      (authRes?.role == "admin" || authRes?.role == "staff")
    ) {
      const assignedPatient = await patientModel.find({ staff: staffId });
      let scheduledPatient = [];
      scheduledPatient = await scheduleModel
        .find({
          staff: staffId,
          Date: date,
        })
        .distinct("patient");

      let availablePatients;
      if (date) {
        availablePatients = assignedPatient.filter((patient) => {
          return !scheduledPatient
            .map((s) => s.toString())
            .includes(patient._id.toString());
        });
      } else {
        availablePatients = assignedPatient;
      }

      return NextResponse.json(
        availablePatients.map((patient) => {
          return {
            id: patient._id,
            value: `${patient.firstName} ${patient.lastName}    (${patient.phone})`,
          };
        })
      );
    } else {
      return NextResponse.json({ status: 401, message: "Token Expired" });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error", error });
  }
}
