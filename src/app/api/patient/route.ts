import AuthCheck from "@/middleware/AuthCheck";
import { NextResponse } from "next/server";
// import { sendEmail } from "../_utils/emailService";
import connection from "@/DB/connection";
import patientModel from "../../../../model/patientSchema";
import { format } from "date-fns";
import uploadToGoogleDrive from "../_utils/uploadToGoogleDrive";

export async function POST(req: Request) {
  await connection();
  const token = req.headers.get("authorization");
  const res = await AuthCheck(token as string);

  if (
    typeof res === "object" &&
    "role" in res &&
    (res.role === "admin" || res.role === "staff")
  ) {
    const data = await req.formData();
    const imageFile = data.get("profileImage") as File | null;

    const isExist = await patientModel.findOne({ email: data.get("email") });
    if (isExist) {
      return NextResponse.json({
        success: false,
        message: "Email Already Exists",
      });
    }

    const patient = new patientModel({
      firstName: data.get("firstName") as string,
      lastName: data.get("lastName") as string,
      staff: data.get("staff") || "No Staff Assigned",
      email: data.get("email") as string,
      age: data.get("age") as string,
      phone: data.get("phone"),
      role: "patient",
      profileImage: "", // placeholder
      flatNo: data.get("flatNo"),
      area: data.get("area"),
      city: data.get("city"),
      state: data.get("state"),
      zipCode: data.get("zipCode"),
      bloodGroup: data.get("bloodGroup"),
      diagnosed: data.get("diagnosed"),
      primaryDoctor: data.get("primaryDoctor"),
      medicalHistory: data.get("medicalHistory"),
      registered: format(new Date(), "dd/MM/yyyy"),
    });

    await patient.save(); // get _id

    // ✅ Upload profile image to Google Drive
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadRes = await uploadToGoogleDrive({
        file: buffer,
        filename: imageFile.name,
        mimeType: imageFile.type,
        id: patient._id.toString(),
      });

      const res = await patientModel.findByIdAndUpdate(
        patient._id,
        {
          profileImage: uploadRes.viewLink,
        },
        { new: true }
      );
      console.log("repswfsd", res);
    }

    return NextResponse.json({
      success: true,
      message: "Patient added successfully",
    });
  } else {
    return NextResponse.json({ status: 401, message: "Unauthorized" });
  }
}

export async function GET(req: Request) {
  try {
    await connection();
    const res = await AuthCheck(req.headers.get("authorization") as string);
    const { searchParams } = new URL(req.url);
    if (typeof res == "object" && res.status == 401) {
      return NextResponse.json({ status: 401 });
    }
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = searchParams.get("pageSize");
    const search = searchParams.get("search") || "";
    const sortKey = searchParams.get("sortKey") || "firstName";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;

    // Build search filter (searches all string fields)
    const searchFilter = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { staff: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Only allow sorting on certain fields
    const allowedSortKeys = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "createdAt",
      "role",
    ];
    const sort: { [key: string]: 1 | -1 } = allowedSortKeys.includes(sortKey)
      ? { [sortKey]: sortOrder as 1 | -1 }
      : { firstName: 1 };

    const totalCount = await patientModel.countDocuments(searchFilter);
    let patients;
    if (pageSize) {
      patients = await patientModel
        .find(searchFilter)
        .sort(sort)
        .skip((page - 1) * parseInt(pageSize))
        .limit(parseInt(pageSize))
        .lean();
    } else {
      patients = await patientModel.find(searchFilter).sort(sort).lean();
    }

    // Format createdAt as string for frontend

    return NextResponse.json({
      patient: patients,
      totalPages: Math.ceil(totalCount / parseInt(pageSize || "5")),
    });
  } catch (err) {
    console.error("Error fetching patients:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    console.log(id);
    if (id) {
      await patientModel.findByIdAndDelete(id);
      return NextResponse.json({
        success: true,
        message: "Data Deleted",
        id: id,
      });
    } else {
      return NextResponse.json({
        success: false,
        messsage: "ID NOT FOUND",
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function PATCH(req: Request) {
  try {
    await connection();
    const token = req.headers.get("authorization");
    const res = await AuthCheck(token as string);

    const { searchParams } = new URL(req.url);
    const data = await req.formData();
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Missing patient ID",
      });
    }

    if (
      typeof res !== "object" ||
      !("role" in res) ||
      !["admin", "staff"].includes(res.role)
    ) {
      return NextResponse.json({ status: 401, message: "Unauthorized" });
    }

    let imageUrl = "";

    const imageFile = data.get("profileImage") as File | null;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadRes = await uploadToGoogleDrive({
        file: buffer,
        filename: imageFile.name,
        mimeType: imageFile.type,
        id: id.toString(),
      });

      imageUrl = uploadRes.viewLink as string;
    }

    await patientModel.findByIdAndUpdate(id, {
      firstName: data.get("firstName") as string,
      lastName: data.get("lastName") as string,
      staff: data.get("staff") || "No Staff Assigned",
      email: data.get("email") as string,
      age: data.get("age") as string,
      phone: data.get("phone"),
      role: "patient",
      flatNo: data.get("flatNo"),
      area: data.get("area"),
      city: data.get("city"),
      state: data.get("state"),
      zipCode: data.get("zipCode"),
      bloodGroup: data.get("bloodGroup"),
      diagnosed: data.get("diagnosed"),
      primaryDoctor: data.get("primaryDoctor"),
      medicalHistory: data.get("medicalHistory"),
      registered: format(new Date(), "dd/MM/yyyy"),
      ...(imageUrl && { profileImage: imageUrl }),
    });

    return NextResponse.json({
      success: true,
      message: "Patient data updated successfully",
    });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
