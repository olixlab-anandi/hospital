import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

export const sendEmail = createAsyncThunk(
  "/forgotpassword/sendEmail",
  async (email: string) => {
    try {
      const res = await axios.post("/api/forgotPassword/sendEmail", { email });
      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      } else {
        return res.data;
      }
    } catch (error) {
      console.log(error);
    }
  }
);

interface otpverificationprops {
  email: string;
  otp: string;
}
export const verifyOtp = createAsyncThunk(
  "/forgotPassword/verify",
  async (obj: otpverificationprops) => {
    try {
      const res = await axios.post("/api/forgotPassword/verifyOTP", obj);
      if (res.data.success) {
        return res.data;
      } else {
        toast.error(res.data.message);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  }
);

interface resetPassPropes {
  email: string;
  password: string;
}

export const resetPass = createAsyncThunk(
  "/forgotpassword/resetPass",
  async (obj: resetPassPropes) => {
    try {
      const res = await axios.post("/api/forgotPassword/resetpassword", obj);
      if (res.data.success) {
        toast.success("Password Updated Succesfully");
      } else {
        toast.error(res.data.message);
      }
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);
