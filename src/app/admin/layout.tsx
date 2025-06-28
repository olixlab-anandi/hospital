"use client";

import React from "react";
import { redirect } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import { logout } from "../../../store/features/auth/authSlice";
import { setActiveTab } from "../../../store/features/admin/adminSlice";
import ProtectedRoute from "../../../components/common/ProtectedRoute";

const NAV_ITEMS = [
  {
    key: "home",
    label: "Dashboard",
    path: "/admin",
    icon: (
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"
        />
      </svg>
    ),
  },
  {
    key: "staff",
    label: "Staff Members",
    path: "/admin/staff-details",
    icon: (
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0zm6 8v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a6 6 0 0112 0z" />
      </svg>
    ),
  },
  {
    key: "patients",
    label: "Patients",
    path: "/admin/patient-detail",
    icon: (
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
  {
    key: "profile",
    label: "Profile",
    path: "/admin/profile",
    icon: (
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20v-2a4 4 0 014-4h8a4 4 0 014 4v2" />
      </svg>
    ),
  },
];

const PRIMARY = "#1A237E";
const ACCENT = "#64B5F6";
const BG = "#F5F7FA";
const SIDEBAR_BG = "#fff";
const SIDEBAR_BORDER = "#E3E8EF";
const ACTIVE_BG = "#E3F2FD";
const ACTIVE_TEXT = "#1A237E";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const activeTab = useSelector((state: RootState) => state.staff.activeTab);
  const dispatch = useDispatch<AppDispatch>();

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  React.useEffect(() => {
    if (!isAuthenticated) redirect("/login");
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    redirect("/login");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-4 shadow"
        style={{ background: PRIMARY, color: "#fff" }}
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="4"
              stroke="#fff"
              strokeWidth="2"
              fill={ACCENT}
            />
            <path d="M8 12h8M12 8v8" stroke={PRIMARY} strokeWidth="2" />
          </svg>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="font-medium tracking-wide bg-white/10 px-4 py-2 rounded hover:bg-white/20 transition"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className="w-64 flex flex-col py-8 px-4 border-r"
          style={{
            background: SIDEBAR_BG,
            borderColor: SIDEBAR_BORDER,
            minHeight: "calc(100vh - 64px)",
            borderRightWidth: 2,
          }}
        >
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`flex items-center px-4 py-3 rounded-lg font-semibold text-base transition
                  ${
                    activeTab === item.key
                      ? "shadow bg-blue-100"
                      : "hover:bg-gray-100"
                  }
                `}
                style={{
                  color: activeTab === item.key ? ACTIVE_TEXT : "#607D8B",
                  background:
                    activeTab === item.key ? ACTIVE_BG : "transparent",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                }}
                onClick={() => {
                  dispatch(setActiveTab(item.key));
                  redirect(item.path);
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <ProtectedRoute>
          <main className="flex-1 p-8">{children}</main>{" "}
        </ProtectedRoute>
      </div>

      {/* Footer */}
      <footer
        className="text-center py-3"
        style={{ background: PRIMARY, color: "#fff" }}
      >
        &copy; {new Date().getFullYear()} Hospital Management System
      </footer>
    </div>
  );
}

export default DashboardLayout;
