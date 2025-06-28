"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaUserShield,
  FaUserEdit,
  FaKey,
} from "react-icons/fa";

function Profile() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl p-10 border border-[#B3E5FC] mt-16 animate-fade-in-down relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#B3E5FC] opacity-30 rounded-full blur-2xl animate-float-slow z-0"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#0288D1] opacity-20 rounded-full blur-2xl animate-float z-0"></div>
      <div className="relative z-10 flex flex-col items-center mb-8">
        {user.profileImage ? (
          <Image
            src={user.profileImage}
            alt="Profile"
            width={112}
            height={112}
            className="w-28 h-28 rounded-full object-cover shadow-lg border-4 border-[#B3E5FC] animate-float"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#B3E5FC] to-[#0288D1] flex items-center justify-center text-5xl text-white font-extrabold shadow-lg animate-float">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>
        )}
        <h2 className="text-3xl font-bold text-[#0288D1] mt-4 animate-fade-in flex items-center gap-2">
          <FaUserShield className="text-[#64B5F6]" />
          {user.firstName} {user.lastName}
        </h2>
        <span className="text-[#1A237E] font-medium capitalize mt-1 animate-fade-in-up">
          {user.role}
        </span>
      </div>
      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-3 animate-fade-in">
          <FaEnvelope className="text-[#0288D1] text-xl" />
          <span className="text-[#0288D1] font-semibold w-24">Email:</span>
          <span className="font-medium">{user.email}</span>
        </div>
        <div className="flex items-center gap-3 animate-fade-in-up">
          <FaPhoneAlt className="text-[#0288D1] text-xl" />
          <span className="text-[#0288D1] font-semibold w-24">Phone:</span>
          <span className="font-medium">{user.phone}</span>
        </div>
        <div className="flex items-center gap-3 animate-fade-in">
          <FaUserShield className="text-[#0288D1] text-xl" />
          <span className="text-[#0288D1] font-semibold w-24">Role:</span>
          <span className="capitalize">{user.role}</span>
        </div>
      </div>
      <div className="mt-10 flex flex-col md:flex-row justify-center gap-4 relative z-10">
        <Link
          href="/resetPassword"
          className="flex items-center gap-2 bg-[#0288D1] text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-[#01579b] transition-all duration-200 animate-fade-in-up"
        >
          <FaKey /> Reset Password
        </Link>
        <Link
          href="/admin/edit-profile"
          className="flex items-center gap-2 bg-[#64B5F6] text-[#1A237E] px-6 py-2 rounded-full font-semibold shadow hover:bg-[#0288D1] hover:text-white transition-all duration-200 animate-fade-in-up"
        >
          <FaUserEdit /> Edit Profile
        </Link>
      </div>
    </div>
  );
}

export default Profile;
