import { NextResponse } from "next/server";
import connection from "@/DB/connection";
import scheduleModel from "../../../../model/scheduleSchema";
import AuthCheck from "@/middleware/AuthCheck";

import patientModel from "../../../../model/patientSchema"; // Required for Mongoose .populate("patient")
void patientModel;
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      patient,
      Date,
      StartTime,
      EndTime,
      Fees,
      Location,
      Notes,
      Status,
      sessionGap,
    } = body;
    if (!patient || !Date || !EndTime || !StartTime || !Status) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    await connection();
    const token = req.headers.get("authorization");
    const authRes = await AuthCheck(token as string);

    if (
      typeof authRes == "object" &&
      "role" in authRes &&
      (authRes?.role == "admin" || authRes?.role == "staff")
    ) {
      const schedule = new scheduleModel({
        staff: authRes.id,
        Date,
        StartTime,
        EndTime,
        Fees,
        Location,
        Notes,
        Status,
        patient: patient,
        sessionGap: sessionGap || 1,
      });

      await schedule.save();
      return NextResponse.json({
        success: true,
        message: "Schedule created successfully",
      });
    } else {
      return NextResponse.json(
        { status: 401, error: "Unauthorized" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connection();
    await AuthCheck(req.headers.get("authorization") as string);
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = searchParams.get("pageSize");
    const search = searchParams.get("search") || "";
    const sortKey = searchParams.get("sortKey") || "Date";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;

    // Build search filter (searches all string fields)
    const searchFilter = search
      ? {
          $or: [
            { Date: { $regex: search, $options: "i" } },
            { StartTime: { $regex: search, $options: "i" } },
            { EndTime: { $regex: search, $options: "i" } },
            { Location: { $regex: search, $options: "i" } },
            { Notes: { $regex: search, $options: "i" } },
            { Status: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Only allow sorting on certain fields
    const allowedSortKeys = [
      "Date",
      "StartTime",
      "EndTime",
      "Fees",
      "createdAt",
    ];
    const sort: { [key: string]: 1 | -1 } = allowedSortKeys.includes(sortKey)
      ? { [sortKey]: sortOrder as 1 | -1 }
      : { Date: 1 };

    const totalCount = await scheduleModel.countDocuments(searchFilter);
    let schedules;
    if (pageSize)
      schedules = await scheduleModel
        .find(searchFilter)
        .sort(sort)
        .skip((page - 1) * parseInt(pageSize))
        .limit(parseInt(pageSize))
        .populate("patient", "firstName lastName")
        .lean();
    else {
      schedules = await scheduleModel
        .find(searchFilter)
        .sort(sort)
        .populate("patient", "firstName lastName")
        .lean();
    }

    // Format createdAt as string for frontend
    const formattedSchedules = schedules.map((s) => ({
      ...s,
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : "",
    }));

    return NextResponse.json({
      schedules: formattedSchedules,
      totalPages: Math.ceil(totalCount / parseInt(pageSize || "5")),
    });
  } catch (err) {
    console.error("Error fetching schedules:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connection();
    const token = req.headers.get("authorization");
    const authRes = await AuthCheck(token as string);
    if (
      typeof authRes == "object" &&
      "role" in authRes &&
      (authRes?.role == "admin" || authRes?.role == "staff")
    ) {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      if (!id) {
        return new Response(
          JSON.stringify({ error: "ID is required" }),

          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      await scheduleModel.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: "Schedule deleted successfully",
        id: id,
      });
    } else {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const {
      patient,
      Date,
      StartTime,
      EndTime,
      Fees,
      Location,
      Notes,
      Status,
      sessionGap,
    } = body;
    if (!patient || !Date || !StartTime || !EndTime || !Status) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    await connection();
    const token = req.headers.get("authorization");
    const authRes = await AuthCheck(token as string);

    if (
      typeof authRes == "object" &&
      "role" in authRes &&
      (authRes?.role == "admin" || authRes?.role == "staff")
    ) {
      await scheduleModel.findByIdAndUpdate(id, {
        patient,
        Date,
        StartTime,
        EndTime,
        Fees,
        Location,
        Notes,
        Status,
        sessionGap: sessionGap || 1,
      });
      return NextResponse.json({
        success: true,
        message: "Schedule UPDATED successfully",
        id: id,
      });
    } else {
      return NextResponse.json(
        { status: 401, error: "Unauthorized" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
