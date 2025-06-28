import React from "react";

function Footer() {
  return (
    <footer className="w-full bg-[#0288D1] text-white py-4 mt-12 animate-fade-in-up">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6">
        <span className="font-semibold text-lg">
          &copy; {new Date().getFullYear()} Hospital Management System
        </span>
        <span className="text-sm mt-2 md:mt-0">
          Designed & Developed with{" "}
          <span className="animate-pulse text-[#B3E5FC]">♥</span>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
