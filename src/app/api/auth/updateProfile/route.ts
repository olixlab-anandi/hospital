import adminSchema from "../../../../../model/adminSchema";
import cloudinary from "../../../../../cloudinary";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connection from "@/DB/connection";

export async function PATCH(req: Request) {
  try {
    await connection();
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;
    const imageFile = formData.get("profileImage") as File | null;
    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      // Convert File to base64 string for cloudinary upload
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const dataUri = `data:${imageFile.type};base64,${base64}`;
      const uploadRes = await cloudinary.uploader.upload(dataUri, {
        folder: "hospital/profiles",
        public_id: `user_${phone}`,
        overwrite: true,
      });
      imageUrl = uploadRes.secure_url;
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const updated = await adminSchema.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        email,
        phone,
        role,
        ...(imageUrl && { profileImage: imageUrl }),
      },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const { password, ...updatedData } = updated.toObject();
    console.log(password);
    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedData,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update profile", error: (error as Error).message },
      { status: 500 }
    );
  }
}
