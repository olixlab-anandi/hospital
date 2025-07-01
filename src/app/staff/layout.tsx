"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { logout } from "../../../store/features/auth/authSlice";
import { redirect } from "next/navigation";
import { setActiveTab } from "../../../store/features/admin/adminSlice";
import { FaHome, FaUser, FaUserInjured, FaBars, FaTimes } from "react-icons/fa";
import { FaRegClock, FaRegCalendarAlt } from "react-icons/fa";
import ProtectedRoute from "../../../components/common/ProtectedRoute";

const NAV_ITEMS = [
  {
    key: "home",
    label: "Home",
    path: "/staff",
    icon: <FaHome className="mr-3 text-lg" />,
  },
  {
    key: "profile",
    label: "My Profile",
    path: "/staff/profile",
    icon: <FaUser className="mr-3 text-lg" />,
  },
  {
    key: "patients",
    label: "Patients",
    path: "/staff/patients",
    icon: <FaUserInjured className="mr-3 text-lg" />,
  },
  {
    key: "schedule",
    label: "Schedule",
    path: "/staff/schedule",
    icon: <FaRegClock className="mr-3 text-lg" />, // Changed to clock
  },
  {
    key: "celender",
    label: "Calendar View",
    path: "/staff/celender",
    icon: <FaRegCalendarAlt className="mr-3 text-lg" />, // Changed to calendar
  },
];

const SIDEBAR_ACTIVE_BG = "#E3F2FD";
const SIDEBAR_TEXT = "#0288D1";
const PRIMARY = "#1A237E";
const ACCENT = "#64B5F6";
const SIDEBAR_BG = "#fff";

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const activeTab = useSelector((state: RootState) => state.staff.activeTab);
  const dispatch = useDispatch<AppDispatch>();

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle window resize to auto-close sidebar on md+
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleLogout() {
    dispatch(logout());
    redirect("/login");
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F5F7FA" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 md:px-8 py-4 shadow"
        style={{ background: PRIMARY, color: "#fff" }}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger for mobile */}
          <button
            className="md:hidden mr-2"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars size={24} />
          </button>
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
          <h1 className="text-2xl font-bold tracking-tight ">
            Staff Dashboard
          </h1>
        </div>
        <button className="font-medium tracking-wide" onClick={handleLogout}>
          logout
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar for md+ */}
        <aside
          className={`
            hidden lg:flex lg:w-64 flex-col py-8 px-4 border-r
          `}
          style={{
            background: SIDEBAR_BG,
            borderColor: ACCENT,
            borderRightWidth: 2,
          }}
        >
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg font-semibold text-base transition
                  ${
                    activeTab === item.key
                      ? "shadow bg-[#B3E5FC]"
                      : "hover:bg-blue-50"
                  }
                `}
                style={{
                  color: activeTab === item.key ? SIDEBAR_TEXT : "#607D8B",
                  background:
                    activeTab === item.key ? SIDEBAR_ACTIVE_BG : "transparent",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                }}
                onClick={() => dispatch(setActiveTab(item.key))}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Sidebar for mobile (slide from top) */}
        <div
          className={`
            fixed inset-0 z-40 transition-all duration-300
            ${sidebarOpen ? "block" : "hidden"}
            md:hidden
          `}
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className={`
              absolute top-0 left-0 w-full rounded-b-2xl shadow-lg
              bg-white py-8 px-4
              transition-transform duration-300
              ${sidebarOpen ? "translate-y-0" : "-translate-y-full"}
            `}
            style={{
              borderBottom: `2px solid ${ACCENT}`,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg text-[#0288D1]">Menu</span>
              <button
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
                className="text-[#0288D1]"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg font-semibold text-base transition
                    ${
                      activeTab === item.key
                        ? "shadow bg-[#B3E5FC]"
                        : "hover:bg-blue-50"
                    }
                  `}
                  style={{
                    color: activeTab === item.key ? SIDEBAR_TEXT : "#607D8B",
                    background:
                      activeTab === item.key
                        ? SIDEBAR_ACTIVE_BG
                        : "transparent",
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    dispatch(setActiveTab(item.key));
                    setSidebarOpen(false);
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>

        <ProtectedRoute>
          <main className="flex-1 p-4 md:p-8">{children}</main>
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
};

export default StaffLayout;
