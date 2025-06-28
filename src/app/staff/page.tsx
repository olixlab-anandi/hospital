"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  FaUserInjured,
  FaClipboardList,
  FaBell,
  FaUser,
  FaTimes,
} from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { getPatient } from "../../../store/features/patient/patientAction";
import { getSchedule } from "../../../store/features/schedule/scheduleActions";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const statusColor = {
  Scheduled: "text-yellow-600",
  Completed: "text-green-600",
  Cancelled: "text-red-500",
};

export default function StaffDashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [patients, setpatients] = useState<Record<string, string>[]>([]);
  const [schedules, setSchedules] = useState<Record<string, string>[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const staff = useSelector((state: RootState) => state.auth.user);
  const staffFullName = `${staff.firstName} ${staff.lastName}`;

  useEffect(() => {
    dispatch(getPatient({})).then((res) => {
      if (res?.payload?.patient) {
        const staffPatients = res.payload.patient.filter(
          (p: Record<string, string>) => p.staff == staff._id
        );
        setpatients(staffPatients);
      }
    });
    dispatch(getSchedule({})).then((res) => {
      if (res.payload.schedules) {
        const staffSchedules = res.payload.schedules?.filter(
          (s: Record<string, string>) => s.staff === staff._id
        );

        setSchedules(staffSchedules);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, staffFullName]);
  const scheduleStatusCounts = [
    schedules.filter((s) => s.Status === "Scheduled").length,
    schedules.filter((s) => s.Status === "Completed").length,
    schedules.filter((s) => s.Status === "Cancelled").length,
  ];
  console.log(
    "Schedule Status Counts:",
    scheduleStatusCounts,
    "Schedules:",
    schedules
  );
  const doughnutData = {
    labels: ["Scheduled", "Completed", "Cancelled"],
    datasets: [
      {
        data: scheduleStatusCounts,
        backgroundColor: ["#FFD600", "#00C853", "#FF5252"],
        hoverBackgroundColor: ["#FFF59D", "#B9F6CA", "#FF8A80"],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: schedules.map((s) => s.Date),
    datasets: [
      {
        label: "Fees Collected",
        data: schedules.map((s) => Number(s.Fees)),
        backgroundColor: "#0288D1",
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    animation: {
      duration: 1200,
      easing: "easeInOutQuart" as const,
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: "#E3E8EF" } },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] to-[#F5F7FA] py-4 px-1 sm:py-6 sm:px-2 md:py-8 md:px-4 lg:px-8">
      <div className="max-w-6xl mx-auto relative">
        {/* Notification Bell */}
        <div className="flex justify-end mb-3 sm:mb-4">
          <button
            className="relative"
            onClick={() => setShowPopup((v) => !v)}
            aria-label="Show assigned patients"
          >
            <FaBell className="text-xl sm:text-2xl text-[#0288D1]" />
            {patients.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-bounce">
                {patients.length}
              </span>
            )}
          </button>
        </div>
        {/* Popup for assigned patients */}
        {showPopup && (
          <div className="absolute right-0 z-20 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-[#B3E5FC] p-3 sm:p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-[#0288D1]">
                Newly Assigned Patients
              </span>
              <button
                className="text-gray-400 hover:text-red-500"
                onClick={() => setShowPopup(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            {patients.length === 0 ? (
              <div className="text-sm text-[#90A4AE] py-4 text-center">
                No new patients assigned.
              </div>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {patients.map((p) => (
                  <li
                    key={p.email}
                    className="flex items-center gap-2 py-2 border-b border-[#E3E8EF] last:border-b-0"
                  >
                    {p.profileImage ? (
                      <Image
                        src={p.profileImage}
                        alt={p.firstName}
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-lg text-[#B3E5FC]" />
                    )}
                    <div>
                      <div className="font-semibold text-[#0288D1]">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-xs text-[#607D8B]">{p.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Stats & Charts */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex  xs:flex-row gap-3 sm:gap-4">
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center">
              <FaUserInjured className="text-2xl sm:text-3xl text-[#0288D1] mb-1 sm:mb-2" />
              <span className="text-xl sm:text-2xl font-bold text-[#0288D1]">
                {patients.length}
              </span>
              <span className="text-xs sm:text-sm text-[#1A237E]">
                My Patients
              </span>
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center">
              <FaClipboardList className="text-2xl sm:text-3xl text-[#0288D1] mb-1 sm:mb-2" />
              <span className="text-xl sm:text-2xl font-bold text-[#0288D1]">
                {schedules.length}
              </span>
              <span className="text-xs sm:text-sm text-[#1A237E]">
                Total Schedules
              </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 flex-1 md:max-w-[70%] flex flex-col items-center min-w-0">
              <span className="font-semibold text-[#0288D1] mb-2">
                Fees Collected
              </span>
              <div className="w-full min-w-0">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 flex-1 md:max-w-[30%] flex flex-col items-center min-w-0">
              <span className="font-semibold text-[#0288D1] mb-2">
                Schedule Status
              </span>
              <div className="w-full flex justify-center">
                <Doughnut data={doughnutData} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Patients Table */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-[#0288D1] mb-3 sm:mb-4 flex items-center gap-2">
            <FaUserInjured /> My Recent Patients
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-[480px] sm:min-w-[600px] w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#E3F2FD] text-[#1A237E]">
                  <th className="py-2 px-3 text-left">#</th>
                  <th className="py-2 px-3 text-left">Name</th>
                  <th className="py-2 px-3 text-left">Email</th>
                  <th className="py-2 px-3 text-left">Phone</th>
                  <th className="py-2 px-3 text-left">Registered</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 5).map((p, idx) => (
                  <tr key={p.email} className="border-b border-[#E3E8EF]">
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3 flex items-center gap-2">
                      {p.profileImage ? (
                        <Image
                          src={p.profileImage}
                          alt={p.firstName}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-lg text-[#B3E5FC]" />
                      )}
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="py-2 px-3">{p.email}</td>
                    <td className="py-2 px-3">{p.phone}</td>
                    <td className="py-2 px-3">{p.registered}</td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-[#90A4AE]">
                      No patients assigned to you.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Schedules Table */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-[#0288D1] mb-3 sm:mb-4 flex items-center gap-2">
            <FaClipboardList /> Recent Schedules
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-[480px] sm:min-w-[600px] w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#E3F2FD] text-[#1A237E]">
                  <th className="py-2 px-3 text-left">#</th>
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-left">Time</th>
                  <th className="py-2 px-3 text-left">Fees</th>
                  <th className="py-2 px-3 text-left">Location</th>
                  <th className="py-2 px-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.slice(0, 5).map((s, idx) => (
                  <tr
                    key={s.Date + s.Time + idx}
                    className="border-b border-[#E3E8EF]"
                  >
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3">{s.Date}</td>
                    <td className="py-2 px-3">{s.Time}</td>
                    <td className="py-2 px-3">₹{s.Fees}</td>
                    <td className="py-2 px-3">{s.Location}</td>
                    <td
                      className={`py-2 px-3 font-semibold ${
                        statusColor[s.Status as keyof typeof statusColor]
                      }`}
                    >
                      {s.Status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
