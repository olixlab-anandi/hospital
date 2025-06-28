"use client";

import React from "react";
import Image from "next/image";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import { FaHospitalAlt, FaUserMd, FaHeartbeat } from "react-icons/fa";

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
  return (
    <>
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
      <Footer />
    </>
  );
}
