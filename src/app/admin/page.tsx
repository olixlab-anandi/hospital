"use client";

import React from "react";
import { FaUserMd, FaUserNurse, FaUserInjured, FaUsers } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

function AdminDashboard() {
  // Example: get these from Redux or props in real app
  const totalStaff = useSelector((state: RootState) => state.staff.total);
  const totalPatients = useSelector((state: RootState) => state.patient.total);

  return (
    <div className="min-h-[90vh] bg-[#F5F7FA] py-12 px-4 flex flex-col items-center animate-fade-in">
      {/* Dashboard Title */}
      <h1 className="text-4xl font-extrabold text-[#0288D1] mb-2 flex items-center gap-3">
        <FaUserMd className="text-[#64B5F6]" /> Admin Dashboard
      </h1>
      <p className="text-[#1A237E] text-lg mb-10 text-center max-w-xl">
        Welcome to your hospital dashboard. Here you can see a quick overview of
        your staff and patients.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mb-12">
        <div className="bg-gradient-to-br from-[#0288D1] to-[#64B5F6] rounded-2xl shadow-xl flex flex-col items-center justify-center py-10 px-6 hover:scale-105 transition-transform duration-300">
          <FaUserNurse className="text-white text-5xl mb-4 drop-shadow" />
          <span className="text-5xl font-extrabold text-white">
            {totalStaff}
          </span>
          <span className="text-lg text-[#E3F2FD] font-semibold mt-2 tracking-wide">
            Total Staff
          </span>
        </div>
        <div className="bg-gradient-to-br from-[#64B5F6] to-[#0288D1] rounded-2xl shadow-xl flex flex-col items-center justify-center py-10 px-6 hover:scale-105 transition-transform duration-300">
          <FaUserInjured className="text-white text-5xl mb-4 drop-shadow" />
          <span className="text-5xl font-extrabold text-white">
            {totalPatients}
          </span>
          <span className="text-lg text-[#E3F2FD] font-semibold mt-2 tracking-wide">
            Total Patients
          </span>
        </div>
      </div>

      {/* Call to Action or Info */}
      <div className="bg-white rounded-xl shadow-lg px-8 py-8 max-w-xl w-full flex flex-col items-center border border-[#B3E5FC]">
        <FaUsers className="text-[#0288D1] text-4xl mb-2" />
        <h2 className="text-2xl font-bold text-[#0288D1] mb-2">
          Manage Hospital
        </h2>
        <p className="text-[#1A237E] text-center mb-4">
          Use the navigation to add new staff, register patients, or view
          detailed reports. Keep your hospital data up to date for the best
          care!
        </p>
        <div className="flex gap-4">
          <button className="bg-[#0288D1] hover:bg-[#01579b] text-white px-6 py-2 rounded-full font-semibold shadow transition-all duration-200">
            Add Staff
          </button>
          <button className="bg-[#64B5F6] hover:bg-[#0288D1] text-white px-6 py-2 rounded-full font-semibold shadow transition-all duration-200">
            Add Patient
          </button>
        </div>
      </div>

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
        .animate-fade-in {
          animation: fade-in 1s both;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
