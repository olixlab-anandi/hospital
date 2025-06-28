"use client";

import React, { useState } from "react";
import { FaEnvelope, FaKey, FaLock, FaCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  resetPass,
  sendEmail,
  verifyOtp,
} from "../../../../store/features/forgotPassword/forgotPasswordActions";
import Link from "next/link";

function ForgotPassword() {
  const dispatch = useDispatch<AppDispatch>();
  const step = useSelector((state: RootState) => state.forgotpass.step);
  const loading = useSelector((state: RootState) => state.forgotpass.isLoading);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handlers
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email) setErrorMsg("Please enter a valid email.");
    else dispatch(sendEmail(email));
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    dispatch(verifyOtp({ email, otp }));
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    dispatch(resetPass({ email, password: newPassword }));
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-[#F5F7FA]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10 border border-[#B3E5FC] animate-fade-in">
        <Stepper step={step} />
        <h2 className="text-2xl font-bold text-[#0288D1] text-center mb-8">
          Forgot Password
        </h2>

        {step === 1 && (
          <FormStep
            onSubmit={handleSendEmail}
            label="Enter your email"
            icon={<FaEnvelope />}
            inputProps={{
              type: "email",
              placeholder: "your@email.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              autoFocus: true,
            }}
            errorMsg={errorMsg}
            loading={loading}
            buttonText="Send OTP"
          />
        )}

        {step === 2 && (
          <FormStep
            onSubmit={handleVerifyOtp}
            label="Enter OTP sent to your email"
            icon={<FaKey />}
            inputProps={{
              type: "text",
              placeholder: "Enter 6-digit OTP",
              value: otp,
              onChange: (e) => setOtp(e.target.value),
              required: true,
              maxLength: 6,
              autoFocus: true,
            }}
            errorMsg={errorMsg}
            loading={loading}
            buttonText="Verify OTP"
          />
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <InputWithIcon
              label="New Password"
              icon={<FaLock />}
              inputProps={{
                type: "password",
                placeholder: "Enter new password",
                value: newPassword,
                onChange: (e) => setNewPassword(e.target.value),
                required: true,
                minLength: 6,
                autoFocus: true,
              }}
            />
            <InputWithIcon
              label="Confirm Password"
              icon={<FaLock />}
              inputProps={{
                type: "password",
                placeholder: "Confirm new password",
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                required: true,
                minLength: 6,
              }}
            />
            {errorMsg && (
              <div className="text-red-500 text-center">{errorMsg}</div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0288D1] to-[#64B5F6] text-white py-3 rounded-full font-bold shadow-lg hover:from-[#01579b] hover:to-[#0288D1] transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-10">
            <FaCheckCircle className="text-green-500 text-6xl mb-4" />
            <div className="text-2xl font-bold text-[#0288D1] mb-2">
              Success!
            </div>
            <div className="text-[#1A237E] mb-4">
              Your password has been reset.
            </div>
            <Link
              href="/login"
              className="bg-gradient-to-r from-[#0288D1] to-[#64B5F6] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:from-[#01579b] hover:to-[#0288D1] transition-all duration-200"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex gap-2 mb-2 justify-center">
      <StepCircle active={step === 1} done={step > 1} label="1" />
      <div className="w-8 h-1 bg-[#B3E5FC] rounded my-auto" />
      <StepCircle active={step === 2} done={step > 2} label="2" />
      <div className="w-8 h-1 bg-[#B3E5FC] rounded my-auto" />
      <StepCircle active={step === 3} done={step > 3} label="3" />
    </div>
  );
}

function StepCircle({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div
      className={`w-9 h-9 flex items-center justify-center rounded-full border-2 ${
        active
          ? "border-[#0288D1] bg-[#E3F2FD] text-[#0288D1]"
          : done
          ? "border-green-400 bg-green-100 text-green-600"
          : "border-[#B3E5FC] bg-white text-[#B3E5FC]"
      } font-bold text-lg transition-all`}
    >
      {done ? <FaCheckCircle className="text-green-500" /> : label}
    </div>
  );
}

function FormStep({
  onSubmit,
  label,
  icon,
  inputProps,
  errorMsg,
  loading,
  buttonText,
}: {
  onSubmit: (e: React.FormEvent) => void;
  label: string;
  icon: React.ReactNode;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  errorMsg: string;
  loading: boolean;
  buttonText: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <InputWithIcon label={label} icon={icon} inputProps={inputProps} />
      {errorMsg && <div className="text-red-500 text-center">{errorMsg}</div>}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#0288D1] to-[#64B5F6] text-white py-3 rounded-full font-bold shadow-lg hover:from-[#01579b] hover:to-[#0288D1] transition-all duration-200"
        disabled={loading}
      >
        {loading ? `${buttonText}...` : buttonText}
      </button>
    </form>
  );
}

function InputWithIcon({
  label,
  icon,
  inputProps,
}: {
  label: string;
  icon: React.ReactNode;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="text-[#1A237E] font-semibold mb-2 flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        {...inputProps}
        className="w-full border border-[#B3E5FC] rounded-lg px-4 py-2 bg-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#64B5F6]"
      />
    </div>
  );
}

export default ForgotPassword;
