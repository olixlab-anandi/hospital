import AuthCheck from "@/middleware/AuthCheck";
import { NextResponse } from "next/server";
import { sendEmail } from "../_utils/emailService";
import adminModel from "../../../../model/adminSchema";
import connection from "@/DB/connection";
import jwt from "jsonwebtoken";

import cloudinary from "../../../../cloudinary";

export async function POST(req: Request) {
  await connection();
  const token = req.headers.get("authorization");
  const res = await AuthCheck(token as string);

  if (typeof res == "object" && "role" in res && res?.role == "admin") {
    const data = await req.formData();
    const imageFile = data.get("profileImage") as File | null;
    let imageUrl = "";

    const staffToken = jwt.sign(
      {
        email: data.get("email"),
      },
      process.env.TOKEN_SECRETE as string,
      {
        expiresIn: "1d",
      }
    );
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background: #f4f8fb; padding: 24px; margin:auto">
        <div style="background: #fff; border-radius: 8px; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #B3E5FC;">
          <h2 style="color: #0288D1;">Hospital Management System</h2>
          <p>Hello <b>${data.get("name") || "User"}</b>,</p>
          <p>Your account information:</p>
          <ul>
            <li><b>Email:</b> ${data.get("email")}</li>
            ${
              data.get("role")
                ? `<li><b>Role:</b> ${data.get("role")}</li>`
                : ""
            }
          </ul>
          <div style="margin-bottom:20px">You have been added as a staff member. We're excited to have you onboard and want to help you get started as quickly and smoothly as possible.</div>
          <div >
            <a  href="${
              process.env.SITE_URL
            }/resetPassword?token=${staffToken}"  style="background: #0288D1; color: #fff; padding: 10px 18px; border-radius: 5px; text-decoration: none; margin:20px auto; ">SET YOUR PASSWORD</a>
          </div>

          <div style="margin: 24px 0;">
            <h3>Here is How to get started</h3>
            <div style:"display:flex; flex-direction:column">
            <a href="http://192.168.1.12:3000/resetPassword" style="color:blue">Set Password</a>
            <a href="http://192.168.1.12:3000/resetPassword" style="color:blue">Reset Password</a>
            </div>
          </div>
          <div style="padding:10px 0px">If you have any questions or need assistance, feel free to reach out to us. We're here to help you every step of the way!</div>
          <p>If you did not request this, please ignore this email.</p>
          <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Hospital Management System</p>
        </div>
      </div>
    `;

    const isExist = await adminModel.findOne({ email: data.get("email") });

    if (isExist) {
      return NextResponse.json({
        success: false,
        message: "Email Already Exist",
      });
    }

    const staff = new adminModel({
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      phone: data.get("phone"),
      flatNo: data.get("flatNo"),
      area: data.get("area"),
      city: data.get("city"),
      state: data.get("state"),
      zipCode: data.get("zipCode"),
      profileImage: "",
      sessionCharge: data.get("sessionCharge"),
      role: "staff",
    });

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const dataUri = `data:${imageFile.type};base64,${base64}`;
      const uploadRes = await cloudinary.uploader.upload(dataUri, {
        folder: "hospital/reports",
        public_id: `user_${staff._id}`,
        overwrite: true,
        resource_type: "video",
      });
      imageUrl = uploadRes.secure_url;
    }

    staff.profileImage = imageUrl || "";
    await staff.save();

    await sendEmail({
      from: "olixlab.50@gmail.com",
      to: data.get("email") as string,
      subject: "Change Your Password",
      text: `Hello ${
        data.get("firstName") || "User"
      },\n\nPlease use the links below to manage your password.`,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: "Data Added Succesfully",
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
    let imageUrl = "";

    if (typeof res == "object" && "role" in res && res?.role == "admin") {
      if (imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${imageFile.type};base64,${base64}`;
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
          folder: "hospital/profiles",
          public_id: `user_${id}`,
          overwrite: true,
        });
        imageUrl = uploadRes.secure_url;
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
        profileImage: imageUrl || "",
        sessionCharge: data.get("sessionCharge"),
      });
      return NextResponse.json({
        success: true,
        message: "Data Edited succesfully",
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
