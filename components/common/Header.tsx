import React from "react";
import Link from "next/link";
function Header() {
  const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];
  return (
    <header className="w-full shadow bg-white/80 backdrop-blur sticky top-0 z-50 animate-fade-in-down">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0288D1]  shadow-lg">
            <svg
              className="w-7 h-7 text-white"
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
                fill="#B3E5FC"
              />
              <path d="M8 12h8M12 8v8" stroke="#0288D1" strokeWidth="2" />
            </svg>
          </span>
          <span className="text-2xl font-bold text-[#0288D1] tracking-tight animate-fade-in">
            Hospital Management System
          </span>
        </div>
        <nav className="hidden md:flex gap-2 items-center">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative px-4 py-2 rounded-full font-semibold text-[#0288D1] transition-all duration-200 hover:bg-[#B3E5FC] hover:text-[#01579b] focus:outline-none focus:ring-2 focus:ring-[#0288D1] group"
            >
              <span className="group-hover:underline group-hover:underline-offset-4">
                {item.label}
              </span>
            </a>
          ))}
          <Link
            href="/login"
            className="ml-4 bg-gradient-to-r from-[#0288D1] to-[#64B5F6] text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:from-[#01579b] hover:to-[#0288D1] transition-all duration-200 border-2 border-[#0288D1] hover:scale-105"
          >
            Login
          </Link>
        </nav>
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          {/* You can add a mobile menu here if needed */}
        </div>
      </div>
    </header>
  );
}

export default Header;
