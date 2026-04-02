"use client";

import React, { useState } from "react";
import Image from "next/image";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import { FaHospitalAlt, FaUserMd, FaHeartbeat } from "react-icons/fa";
import Chat from "./chat";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { logout } from "../../store/features/auth/authSlice";

const NAV_BUTTONS = [
  {
    href: "/login",
    label: "Get Started",
    className:
      "bg-gradient-to-r from-[#0288D1] to-[#64B5F6] text-white px-8 py-3 rounded-full font-bold shadow-xl hover:from-[#01579b] hover:to-[#0288D1] transition-all duration-200 border-2 border-[#0288D1] hover:scale-105 text-lg",
  },
  {
    href: "/about",
    label: "Learn More",
    className:
      "bg-white text-[#0288D1] px-8 py-3 rounded-full font-bold shadow hover:bg-[#B3E5FC] border-2 border-[#0288D1] transition-all duration-200 hover:scale-105 text-lg",
  },
];

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  
  const handleChatClick = () => {
    setChatOpen(true);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {/* {chatOpen && <Chat />} */}
      <Header />

      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-white animate-fade-in">
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 py-10 px-4">
          {/* Left Content */}
          <div className="flex-1 flex flex-col items-start md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <FaHospitalAlt className="text-3xl text-[#0288D1] animate-pulse" />
              <span className="uppercase tracking-widest text-[#0288D1] font-bold text-lg">
                Hospital Management
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0288D1] mb-4 leading-tight animate-fade-in-down">
              Modern <span className="text-[#01579b]">Healthcare</span> <br />
              <span className="bg-gradient-to-r from-[#0288D1] to-[#64B5F6] bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#1A237E] mb-8 animate-fade-in">
              Empower your hospital with seamless staff and patient management,
              real-time analytics, and a beautiful, intuitive interface.
            </p>
            <div className="flex flex-col md:flex-row gap-4 animate-fade-in-up">
              {NAV_BUTTONS.map((btn) => (
                <a key={btn.href} href={btn.href} className={btn.className}>
                  {btn.label}
                </a>
              ))}
            </div>
            {/* Features */}
            <div className="flex gap-6 mt-10">
              <div className="flex flex-col items-center">
                <FaUserMd className="text-3xl text-[#0288D1] mb-1" />
                <span className="text-[#1A237E] font-semibold text-sm">
                  Staff Management
                </span>
              </div>
              <div className="flex flex-col items-center">
                <FaHeartbeat className="text-3xl text-[#64B5F6] mb-1" />
                <span className="text-[#1A237E] font-semibold text-sm">
                  Patient Care
                </span>
              </div>
              <div className="flex flex-col items-center">
                <FaHospitalAlt className="text-3xl text-[#01579b] mb-1" />
                <span className="text-[#1A237E] font-semibold text-sm">
                  Analytics
                </span>
              </div>
            </div>
          </div>
          {/* Right Image */}
          <figure className="flex-1 flex justify-center items-center animate-fade-in-up">
            <div className="relative">
              <Image
                src="/hospital.jpg"
                alt="Hospital Illustration"
                className="w-[340px] md:w-[420px] rounded-2xl shadow-2xl border-4 border-[#B3E5FC] animate-float"
                // loading="lazy"
                width={420}
                height={480}
                priority
              />
              {/* Decorative Circle */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#0288D1] opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-[#64B5F6] opacity-10 rounded-full blur-2xl"></div>
            </div>
          </figure>
        </section>
      </div>
      {/* Chatbot Floating Button
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleChatClick}
          className="bg-[#0288D1] hover:bg-[#01579b] text-white p-4 rounded-full shadow-2xl flex items-center justify-center animate-bounce"
          title="Chat with us"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.93 0-3.68-.684-5-1.807L3 20l1.807-4C3.684 13.68 3 11.93 3 10c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
      {chatOpen && (
        <div className="fixed bottom-20 right-6 w-[380px] h-[560px] bg-white shadow-2xl rounded-xl border border-gray-200 z-50 overflow-hidden flex flex-col">
          <div className="bg-[#0288D1] text-white p-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">Chatbot</h2>
              {isAuthenticated && (
                <p className="text-xs opacity-90">Welcome, {user.firstName || 'User'}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button 
                  onClick={handleLogout} 
                  className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
                  title="Logout"
                >
                  Logout
                </button>
              )}
              <button onClick={() => setChatOpen(false)} className="hover:opacity-80">✕</button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <Chat />
          </div>
        </div>
      )} */}
      <Footer />
    </>
  );
}
