"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";
import React from "react";
import Script from 'next/script'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-[#E3F2FD] via-[#B3E5FC] to-[#F5F7FA] min-h-screen`}
      >
        <Providers>
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
       <Script
          src="http://localhost:3000/embed.js"
          data-origin="http://localhost:3000"
          data-bot-name="Assistant"
          data-primary-color="#0ea5e9"
          strategy="afterInteractive"
        />
    </html>
  );
}
