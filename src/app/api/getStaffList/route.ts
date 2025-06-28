import connection from "@/DB/connection";
import AuthCheck from "@/middleware/AuthCheck";
import adminSchema from "../../../../model/adminSchema";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  try {
    await connection();
    const token = req.headers.get("authorization");
    await AuthCheck(token as string);

    const staffList = await adminSchema.find(
      { role: "staff" },
      { firstName: 1, lastName: 1, _id: 1, phone: 1, sessionCharge: 1 }
    );

    const fullNames = staffList.map((staff) => {
      return {
        id: staff._id,
        value: `${staff.firstName} ${staff.lastName}  (${staff.phone})   \n  Session Charge: [${staff.sessionCharge}]`,
      };
    });
    return NextResponse.json({ success: true, fullNames });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      messsage: "Internal server Error",
    });
  }
}
