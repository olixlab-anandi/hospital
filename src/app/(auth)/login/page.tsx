"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../../../store/features/auth/authActions";
import { AppDispatch, RootState } from "../../../../store/store";

import { redirect } from "next/navigation";
import { setIntialStep } from "../../../../store/features/forgotPassword/forgotPasswordSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const role = useSelector((state: RootState) => state.auth.role);

  useEffect(() => {
    dispatch(setIntialStep());
    if (isAuthenticated) {
      if (role == "admin") {
        redirect("/admin");
      } else if (role == "staff") {
        redirect("/staff");
      }
    }
  });

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(login({ email, password }));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="flex bg-white rounded-lg shadow-md w-full max-w-3xl overflow-hidden">
        {/* Image Section */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src="/hospital.jpg" // Place your image in the public folder as hospital.jpg
            alt="Hospital"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2
            className="text-2xl font-bold mb-6 text-center "
            style={{ color: " #0288D1" }}
          >
            Hospital Management System
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="off"
              />
            </div>
            <div className="flex justify-end mb-6">
              <a
                href="/forgotPassword"
                className="text-sm text-[#0288D1] hover:underline font-semibold transition"
              >
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center"
              disabled={isLoading}
            >
              Login
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 ml-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Hospital Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
