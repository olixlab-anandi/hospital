"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../store/store";
import { resetPass } from "../../../../store/features/auth/authActions";
import { redirect } from "next/navigation";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitted(true);
    dispatch(resetPass({ password, token })).then((res) => {
      if (res.payload.role) {
        redirect(`/${res.payload.role}/profile`);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-[#B3E5FC]">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#0288D1]">
          Set New Password
        </h2>
        {submitted ? (
          <div className="text-center text-[#0288D1] font-medium">
            Your password has been reset successfully.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="password" className="text-[#0288D1] font-medium">
              New Password
            </label>
            <input
              type="password"
              id="password"
              className="border border-[#B3E5FC] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0288D1]"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="confirm" className="text-[#0288D1] font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm"
              className="border border-[#B3E5FC] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0288D1]"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <button
              type="submit"
              className="bg-[#0288D1] text-white rounded px-4 py-2 mt-2 hover:bg-blue-700 transition"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
