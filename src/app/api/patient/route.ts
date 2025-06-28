import AuthCheck from "@/middleware/AuthCheck";
import { NextResponse } from "next/server";
// import { sendEmail } from "../_utils/emailService";
import connection from "@/DB/connection";
import patientModel from "../../../../model/patientSchema";
import { format } from "date-fns";
import cloudinary from "../../../../cloudinary";

export async function POST(req: Request) {
  await connection();
  const token = req.headers.get("authorization");
  const res = await AuthCheck(token as string);

  if (
    typeof res == "object" &&
    "role" in res &&
    (res?.role == "admin" || res?.role == "staff")
  ) {
    const data = await req.formData();
    const imageFile = data.get("profileImage") as File | null;
    let imageUrl = "";

    // const htmlContent = `
    //   <div style="font-family: Arial, sans-serif; background: #f4f8fb; padding: 24px; margin:auto">
    //     <div style="background: #fff; border-radius: 8px; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #B3E5FC;">
    //       <h2 style="color: #0288D1;">Hospital Management System</h2>
    //       <p>Hello <b>${data.name || "User"}</b>,</p>
    //       <p>Your account information:</p>
    //       <ul>
    //         <li><b>Email:</b> ${data.email}</li>
    //         ${data.role ? `<li><b>Role:</b> ${data.role}</li>` : ""}
    //       </ul>
    //       <div style="margin-bottom:20px">You have been added as a patient member. We're excited to have you onboard and want to help you get started as quickly and smoothly as possible.</div>

    //       <div style="padding:10px 0px">If you have any questions or need assistance, feel free to reach out to us. We're here to help you every step of the way!</div>
    //       <p>If you did not request this, please ignore this email.</p>
    //       <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Hospital Management System</p>
    //     </div>
    //   </div>
    // `;

    const isExist = await patientModel.findOne({ email: data.get("email") });

    if (isExist) {
      return NextResponse.json({
        success: false,
        message: "Email Already Exist",
      });
    } else {
      const patient = new patientModel({
        firstName: data.get("firstName") as string,
        lastName: data.get("lastName") as string,
        staff: data.get("staff") || "No Staff Assigned",
        email: data.get("email") as string,
        age: data.get("age") as string,
        phone: data.get("phone"),
        role: "patient",
        profileImage: imageUrl || "",
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

      await patient.save();

      if (imageFile && imageFile.size > 0) {
        const arrayBuffrer = await imageFile?.arrayBuffer();
        const buffer = Buffer.from(arrayBuffrer);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${imageFile.type};base64,${base64}`;
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
          folder: "hospital/profiles",
          public_id: `user_${patient._id}`,
          overwrite: true,
        });
        imageUrl = uploadRes.secure_url;
      }

      await patientModel.findOneAndUpdate(
        { _id: patient._id },
        {
          profileImage: imageUrl,
        }
      );
      // await sendEmail({
      //   from: "olixlab.50@gmail.com",
      //   to: data.email,
      //   subject: "Added As Patient",
      //   text: `Hello ${
      //     data.name || "User"
      //   },\n\nPlease use the links below to manage your password.`,
      //   html: htmlContent,
      // });
    }

    return NextResponse.json({
      success: true,
      message: "Data Added Succesfully",
    });
  } else {
    return NextResponse.json({ status: 401 });
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
    const { searchParams } = new URL(req.url);
    const data = await req.formData();
    const id = searchParams.get("id");
    const imageFile = data.get("profileImage") as File | null;
    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      const arrayBuffrer = await imageFile?.arrayBuffer();
      const buffer = Buffer.from(arrayBuffrer);
      const base64 = buffer.toString("base64");
      const dataUri = `data:${imageFile.type};base64,${base64}`;
      const uploadRes = await cloudinary.uploader.upload(dataUri, {
        folder: "hospital/profiles",
        public_id: `user_${id}`,
        overwrite: true,
      });
      imageUrl = uploadRes.secure_url;
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
    });
    if (imageUrl) {
      await patientModel.findOneAndUpdate(
        { _id: id },
        {
          profileImage: imageUrl,
        }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Data Edited succesfully",
    });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
