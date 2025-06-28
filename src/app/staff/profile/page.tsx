"use client";

import React from "react";
import Image from "next/image";
import {
  FaUserNurse,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaKey,
  FaEdit,
  FaHome,
  FaMoneyBillWave,
} from "react-icons/fa";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

function Profile() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";


  const staff = useSelector((state: RootState) => state.auth.user);
  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-[#F5F7FA] px-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E3E8EF] overflow-hidden">
        {/* Header with Avatar and Edit */}
        <div className="relative bg-gradient-to-r from-[#0288D1] to-[#64B5F6] h-36 flex items-end justify-center">
          <div className="absolute top-4 right-4">
            <Link
              href="/staff/edit-profile"
              className="flex items-center gap-1 bg-white/90 hover:bg-[#B3E5FC] text-[#0288D1] px-3 py-1 rounded-full font-semibold shadow border border-[#B3E5FC] transition-all duration-200 text-sm"
              title="Edit Profile"
            >
              <FaEdit /> Edit
            </Link>
          </div>
          <div className="absolute left-1/2 -bottom-12 -translate-x-1/2">
            <div className="rounded-full bg-white p-2 shadow-lg border-4 border-[#B3E5FC]">
              {staff.profileImage ? (
                <Image
                  src={staff.profileImage}
                  alt="Profile"
                  className="rounded-full object-cover"
                  height={96}
                  width={96}
                  style={{ width: 96, height: 96 }}
                  priority
                />
              ) : (
                <FaUserNurse className="text-[#0288D1] text-6xl" />
              )}
            </div>
          </div>
        </div>
        {/* Name and Role */}
        <div className="pt-16 pb-2 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-[#1A237E] tracking-tight">
            {staff.firstName} {staff.lastName}
          </h2>
          <span className="mt-1 inline-flex items-center gap-2 bg-[#E3F2FD] text-[#0288D1] px-4 py-1 rounded-full font-semibold text-base shadow">
            <FaUserTag /> {staff.role}
          </span>
        </div>
        {/* Info Section */}
        <div className="px-6 py-6 space-y-4">
          <ProfileDetail
            icon={<FaEnvelope />}
            label="Email"
            value={staff.email}
          />
          <ProfileDetail icon={<FaPhone />} label="Phone" value={staff.phone} />
          <ProfileDetail
            icon={<FaHome />}
            label="Address"
            value={`${staff.flatNo}, ${staff.area}, ${staff.city}, ${staff.state} - ${staff.zipCode}`}
          />
          <ProfileDetail
            icon={<FaMoneyBillWave />}
            label="Session Charge"
            value={
              <span className="text-[#0288D1] font-bold">
                ₹{staff.sessionCharge}
              </span>
            }
          />
        </div>
        {/* Actions */}
        <div className="flex justify-center pb-7">
          <Link
            href={`/resetPassword?token=${token}`}
            className="flex items-center gap-2 bg-gradient-to-r from-[#0288D1] to-[#64B5F6] text-white px-6 py-2 rounded-full font-bold shadow-lg hover:from-[#01579b] hover:to-[#0288D1] transition-all duration-200 text-base"
          >
            <FaKey /> Reset Password
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfileDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#0288D1] text-lg">{icon}</span>
      <span className="text-[#607D8B] font-semibold min-w-[110px]">
        {label}:
      </span>
      <span className="text-[#1A237E] font-medium break-all">{value}</span>
    </div>
  );
}

export default Profile;
