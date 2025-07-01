import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { logout } from "../auth/authSlice";
import { FieldValues } from "react-hook-form";

export const addSchedule = createAsyncThunk(
  "schedule/addSchedule",
  async (obj: FieldValues, _thunkApi) => {
    try {
      const res = await axios.post("/api/schedule", obj, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (res.data.status) {
        toast.error(res.data.message);
      }
      if (res.data.status == 401) {
        _thunkApi.dispatch(logout());
      }
      return res.data;
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  }
);

export const getSchedule = createAsyncThunk(
  "schedule/getSchedule",
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
      const res = await axios.get("/api/schedule", {
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

export const deleteSchedule = createAsyncThunk(
  "/schedule/deleteSchedule",
  async (id: string, _thunkApi) => {
    try {
      const res = await axios.delete(`/api/schedule?id=${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (res.data.status === 401) {
        _thunkApi.dispatch(logout());
      }
      toast.success("Schedule deleted successfully");
      return res.data;
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
  }
);

export const editSchedule = createAsyncThunk(
  "shedule/editSchedule",
  async (obj: { id: string; data: Record<string, string> }, _thunkApi) => {
    try {
      const res = await axios.patch(`/api/schedule?id=${obj.id}`, obj.data, {
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

export const getPatientList = createAsyncThunk(
  "schedule/getpatientList",
  async (obj: { staffId: string; date: string }, _thunkApi) => {
    try {
      const res = await axios.get(
        `/api/getPatientList?staffId=${obj.staffId}&date=${obj.date}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (res.data.status == 401) {
        _thunkApi.dispatch(logout());
      }
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getStaffWiseSchedule = createAsyncThunk(
  "schedule/getStaffWiseSchedule",
  async (staffId: string, _thunkApi) => {
    try {
      const res = await axios.get(`/api/staffWiseSchedule?staffId=${staffId}`, {
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
