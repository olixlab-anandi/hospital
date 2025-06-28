"use client";

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { setAuthentication } from "./authSlice";
import { setActiveTab } from "../admin/adminSlice";

interface loginPropes {
  email: string;
  password: string;
}

export const login = createAsyncThunk(
  "auth/login",
  async (obj: loginPropes, _thunkApi) => {
    try {
      const res = await axios.post("/api/auth/login", obj);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        toast.success(res.data.message);
        _thunkApi.dispatch(setAuthentication(res.data));
        _thunkApi.dispatch(setActiveTab("home"));
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }
);

interface resetPassProps {
  password: string;
  token: string | null;
}
export const resetPass = createAsyncThunk(
  "admin/resetPass",
  async (obj: resetPassProps) => {
    const { token, password } = obj;
    try {
      const res = await axios.post(
        `/api/auth/resetPassword`,
        { password: password },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "/auth/updateProfile",
  async (data: FormData) => {
    try {
      const res = await axios.patch("/api/auth/updateProfile", data);
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);
