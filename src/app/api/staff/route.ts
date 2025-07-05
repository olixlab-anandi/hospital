import AuthCheck from "@/middleware/AuthCheck";
import { NextResponse } from "next/server";
import { sendEmail } from "../_utils/emailService";
import adminModel from "../../../../model/adminSchema";
import connection from "@/DB/connection";
import jwt from "jsonwebtoken";

import uploadToGoogleDrive from "../_utils/uploadToGoogleDrive";

export async function POST(req: Request) {
  await connection();
  const token = req.headers.get("authorization");
  const res = await AuthCheck(token as string);

  if (typeof res === "object" && "role" in res && res.role === "admin") {
    const formData = await req.formData();

    const email = formData.get("email")?.toString() || "";
    const isExist = await adminModel.findOne({ email });

    if (isExist) {
      return NextResponse.json({
        success: false,
        message: "Email Already Exists",
      });
    }

    const staff = new adminModel({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      flatNo: formData.get("flatNo"),
      area: formData.get("area"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      profileImage: "", // placeholder
      sessionCharge: formData.get("sessionCharge"),
      role: "staff",
    });

    await staff.save(); // Save first to get the _id

    // 🔄 Upload profile image if provided
    const imageFile = formData.get("profileImage") as File | null;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const imageUrl = await uploadToGoogleDrive({
        file: buffer,
        filename: imageFile.name,
        mimeType: imageFile.type,
        id: staff._id.toString(),
      });

      staff.profileImage = imageUrl.viewLink as string;
      await staff.save(); // update with image URL
    }

    // 🔐 Create reset token
    const staffToken = jwt.sign(
      { email: staff.email },
      process.env.TOKEN_SECRETE as string,
      { expiresIn: "1d" }
    );

    // 📩 Prepare email HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background: #f4f8fb; padding: 24px; margin:auto">
        <div style="background: #fff; border-radius: 8px; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #B3E5FC;">
          <h2 style="color: #0288D1;">Hospital Management System</h2>
          <p>Hello <b>${formData.get("firstName") || "User"}</b>,</p>
          <p>Your account information:</p>
          <ul>
            <li><b>Email:</b> ${email}</li>
            <li><b>Role:</b> Staff</li>
          </ul>
          <p>You have been added as a staff member. Click the button below to set your password:</p>
          <a href="${
            process.env.SITE_URL
          }/resetPassword?token=${staffToken}" style="background: #0288D1; color: #fff; padding: 10px 18px; border-radius: 5px; text-decoration: none; display:inline-block; margin-top: 16px;">SET YOUR PASSWORD</a>
          <p style="margin-top: 24px;">If you have any questions, feel free to contact us.</p>
          <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Hospital Management System</p>
        </div>
      </div>
    `;

    // ✉️ Send welcome email
    await sendEmail({
      from: "olixlab.50@gmail.com",
      to: email,
      subject: "Set Your Password",
      text: `Hello ${formData.get(
        "firstName"
      )},\n\nPlease use the link below to set your password.`,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: "Staff added successfully",
      id: staff._id,
    });
  } else {
    return NextResponse.json({ status: 401, message: "Unauthorized" });
  }
}

export async function GET(req: Request) {
  try {
    await connection();
    const token = req.headers.get("authorization");
    const res = await AuthCheck(token as string);
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("searchVal");
    const page = parseInt(searchParams.get("page") as string);
    if (typeof res == "object" && "role" in res && res?.role == "admin") {
      let staff;
      let total = await adminModel.countDocuments();
      if (name !== "undefined" && name) {
        staff = await adminModel
          .find({
            role: "staff",
            $or: [
              { firstName: { $regex: name, $options: "i" } },
              { lastName: { $regex: name, $options: "i" } },
            ],
          })
          .skip((page - 1) * 5)
          .limit(5);

        total = staff.length;
      } else {
        staff = await adminModel
          .find({ role: "staff" })
          .skip((page - 1) * 5)
          .limit(5);
      }

      return NextResponse.json({
        staff,
        totalPages: Math.ceil(total / 5),
        total,
      });
    } else {
      return NextResponse.json(res);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      await adminModel.findByIdAndDelete(id);
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
    const imageFile = data.get("profileImage") as File | null;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Missing ID in query params",
      });
    }

    let imageUrl = "";

    if (typeof res === "object" && "role" in res && res?.role === "admin") {
      // Handle image upload
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

      await adminModel.findByIdAndUpdate(id, {
        firstName: data.get("firstName"),
        lastName: data.get("lastName"),
        email: data.get("email"),
        phone: data.get("phone"),
        flatNo: data.get("flatNo"),
        area: data.get("area"),
        city: data.get("city"),
        state: data.get("state"),
        zipCode: data.get("zipCode"),
        sessionCharge: data.get("sessionCharge"),
        ...(imageUrl && { profileImage: imageUrl }),
      });

      return NextResponse.json({
        success: true,
        message: "Data edited successfully",
      });
    } else {
      return NextResponse.json({ status: 401, message: "Unauthorized" });
    }
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
