import { createAsyncThunk } from "@reduxjs/toolkit";

import axios from "axios";
import { logout } from "../auth/authSlice";
import { toast } from "react-toastify";

export const addPatient = createAsyncThunk(
  "admin/add-patient",
  async (obj: FormData, _thunkApi) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/patient", obj, {
        headers: {
          Authorization: token,
        },
      });

      if (res.data.status == 401) {
        _thunkApi.dispatch(logout());
      }

      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }
);

export const getPatient = createAsyncThunk(
  "schedule/getPatient",
  async (
    obj: {
      page?: number;
      pageSize?: number;
      search?: string;
      sortKey?: string;
      sortOrder?: "asc" | "desc";
    },
    _thunkApi
  ) => {
    try {
      const res = await axios.get("/api/patient", {
        params: {
          page: obj.page,
          pageSize: obj.pageSize,
          search: obj.search,
          sortKey: obj.sortKey || "Date",
          sortOrder: obj.sortOrder || "asc",
        },
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (res.data.status == 401) {
        _thunkApi.dispatch(logout());
      }
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);
export const deletePatient = createAsyncThunk(
  "/admin/deletePatient",
  async (id: string, _thunkApi) => {
    try {
      const res = await axios.delete(`/api/patient?id=${id}`);
      if (res.data.status == 401) {
        _thunkApi.dispatch(logout());
      }
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

interface editPatientProps {
  id: string;
  data: FormData;
}

export const editPatient = createAsyncThunk(
  "/admin/editStaff",
  async (obj: editPatientProps, _thunkApi) => {
    const token = localStorage.getItem("token");
    try {
      const { id, data } = obj;
      const res = await axios.patch(`/api/patient?id=${id}`, data, {
        headers: {
          Authorization: token,
        },
      });
      if (res.data.success) {
        toast.success(res.data.message);
      }
      if (res.data.status == 401) {
        _thunkApi.dispatch(logout());
      }
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getStaffList = createAsyncThunk(
  "/patient/getStaffList",
  async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/getStaffList", {
        headers: {
          Authorization: token,
        },
      });
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getPatientById = createAsyncThunk(
  "/patient/getPatientById",
  async (id: string, _thunkApi) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/patient?id=${id}`, {
        headers: {
          Authorization: token,
        },
      });

      if (res.data.status == 401) {
        _thunkApi.dispatch(logout());
        return;
      }

      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);
