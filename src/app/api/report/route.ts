import { NextResponse } from "next/server";
import reports from "../../../../model/reports";
import connection from "@/DB/connection";
import AuthCheck from "@/middleware/AuthCheck";
import { google } from "googleapis";
import path from "path";

export async function POST(req: Request) {
  try {
    await connection();
    const res = await AuthCheck(req.headers.get("authorization") as string);
    const { patient, date, healthStatus, currentCondition, suggestions } =
      await req.json();
    const { searchParams } = new URL(req.url);

    const staff = searchParams.get("staff");
    if (
      typeof res == "object" &&
      "role" in res &&
      (res?.role == "admin" || res?.role == "staff")
    ) {
      const report = new reports({
        patient,
        date,
        healthStatus,
        currentCondition,
        suggestions,
        staff,
      });

      await report.save();

      return NextResponse.json({
        success: true,
        message: "report added",
        id: report._id,
      });
    } else {
      return NextResponse.json({
        success: false,
        status: 401,
        message: "Token Expired",
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Failed to add report",
      error: error,
    });
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
            { date: { $regex: search, $options: "i" } },
            { healthStatus: { $regex: search, $options: "i" } },
            // { patient: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Only allow sorting on certain fields
    const allowedSortKeys = ["date", "patient"];
    const sort: { [key: string]: 1 | -1 } = allowedSortKeys.includes(sortKey)
      ? { [sortKey]: sortOrder as 1 | -1 }
      : { Date: 1 };

    const totalCount = await reports.countDocuments(searchFilter);
    let report;
    if (pageSize)
      report = await reports
        .find(searchFilter)
        .sort(sort)
        .skip((page - 1) * parseInt(pageSize))
        .limit(parseInt(pageSize))
        .populate("patient", "firstName lastName")
        .lean();
    else {
      report = await reports
        .find(searchFilter)
        .sort(sort)
        .populate("patient", "firstName lastName")
        .lean();
    }

    // Format createdAt as string for frontend
    const formattedreport = report.map((s) => ({
      ...s,
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : "",
    }));

    return NextResponse.json({
      report: formattedreport,
      totalPages: Math.ceil(totalCount / parseInt(pageSize || "10")),
    });
  } catch (err) {
    console.error("Error fetching report:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// app/api/report/route.ts

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), "service-account.json"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

export async function PATCH(req: Request) {
  try {
    await connection();
    const user = await AuthCheck(req.headers.get("authorization") as string);

    if (
      !user ||
      typeof user !== "object" ||
      !("role" in user) ||
      (user.role !== "admin" && user.role !== "staff")
    ) {
      return NextResponse.json({ status: 401, message: "Unauthorized" });
    }

    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ status: 400, message: "Missing report ID" });

    const report = await reports.findOne({ _id: id });

    if (!report)
      return NextResponse.json({ status: 404, message: "Report not found" });

    const oldFiles = report.reportFile;

    const newFiles = Array.isArray(body.reportFile)
      ? body.reportFile.flat()
      : [];

    interface ReportFile {
      id: string;
    }
    const newFileIds: string[] = (newFiles as ReportFile[]).map(
      (f: ReportFile) => f.id
    );

    const removedFiles = oldFiles.filter((f) => !newFileIds.includes(f.id));

    for (const file of removedFiles) {
      try {
        await drive.files.delete({ fileId: file.id });
        console.log(`Deleted file ${file.id}`);
      } catch (err) {
        console.error(`Failed to delete file ${file.id}:`, err);
      }
    }

    const updateFields = {
      patient: body.patient,
      staff: body.staff,
      date: body.date,
      healthStatus: body.healthStatus,
      currentCondition: body.currentCondition,
      suggestions: body.suggestions,
      reportFile: newFiles.flat(),
    };

    await reports.findByIdAndUpdate(id, { $set: updateFields });

    return NextResponse.json({
      success: true,
      message: "Report updated",
      id: id,
    });
  } catch (error) {
    console.error("PATCH /api/report error:", error);
    return NextResponse.json({ status: 500, message: "Server error" });
  }
}

export async function DELETE(req: Request) {
  try {
    await connection();
    const res = await AuthCheck(req.headers.get("authorization") as string);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (
      res &&
      typeof res == "object" &&
      "role" in res &&
      (res.role == "admin" || res.role == "staff")
    ) {
      const res = await reports.findByIdAndDelete(id);

      if (res && res.reportFile) {
        for (const file of res.reportFile) {
          try {
            await drive.files.delete({ fileId: file.id });
            console.log(`Deleted file ${file.id}`);
          } catch (err) {
            console.error(`Failed to delete file ${file.id}:`, err);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Data Deleted succesfully",
        id: id,
      });
    } else {
      console.log(res);
      return NextResponse.json({ status: 401, message: "Token Expired" });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      status: 500,
      message: "Internal Server Error",
      error,
    });
  }
}
