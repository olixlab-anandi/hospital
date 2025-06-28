"use client";

import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import Image from "next/image";
import {
  FaUserNurse,
  FaEnvelope,
  FaPhone,
  FaSave,
  FaCamera,
} from "react-icons/fa";
import { redirect } from "next/navigation";
import { updateProfile } from "../../../../store/features/auth/authActions";

function EditProfile() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage: string | File;
  }>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
  });
  const [preview, setPreview] = useState(user.profileImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, profileImage: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", user._id);
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("profileImage", form.profileImage);
    formData.append("role", user.role);
    setIsSubmitting(true);
    dispatch(updateProfile(formData));
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        redirect("/staff/profile");
      }, 1200);
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#B3E5FC] px-10 py-10 animate-fade-in"
        autoComplete="off"
      >
        <div className="flex flex-col items-center mb-8 relative">
          <div
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
            title="Change Profile Image"
          >
            <div className="bg-[#F5F7FA] rounded-full p-2 shadow flex items-center justify-center w-28 h-28">
              {preview ? (
                <Image
                  src={preview}
                  height={24}
                  width={24}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <FaUserNurse className="text-[#0288D1] text-7xl" />
              )}
            </div>
            <div className="absolute bottom-2 right-2 bg-[#0288D1] text-white rounded-full p-2 shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
              <FaCamera className="text-lg" />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <h2 className="text-2xl font-bold text-[#0288D1] mt-4">
            Edit Profile
          </h2>
        </div>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <FaUserNurse className="text-[#0288D1]" />
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="flex-1 border border-[#B3E5FC] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-[#F5F7FA]"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <FaUserNurse className="text-[#0288D1]" />
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="flex-1 border border-[#B3E5FC] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-[#F5F7FA]"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-[#0288D1]" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="flex-1 border border-[#B3E5FC] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-[#F5F7FA]"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <FaPhone className="text-[#0288D1]" />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="flex-1 border border-[#B3E5FC] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-[#F5F7FA]"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-8 w-full flex items-center justify-center gap-2 bg-[#0288D1] text-white px-7 py-3 rounded-full font-bold shadow-lg hover:bg-[#01579b] transition-all duration-200 text-lg"
          disabled={isSubmitting}
        >
          <FaSave />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        {success && (
          <div className="text-green-600 text-center font-semibold mt-4 animate-fade-in-up">
            Profile updated successfully!
          </div>
        )}
        {/* Animations */}
        <style jsx global>{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 1s both;
          }
          .animate-fade-in-up {
            animation: fade-in-up 1.2s both;
          }
        `}</style>
      </form>
    </div>
  );
}

export default EditProfile;
