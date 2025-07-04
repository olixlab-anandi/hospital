import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { logout } from "../auth/authSlice";

interface AddReportParams {
  id: string;
  data: Record<string, string>;
}

interface ReportResponse {
  status: number;
  message: string;
}

export const addReport = createAsyncThunk<ReportResponse, AddReportParams>(
  "/report/add",
  async ({ id, data }, _thunkApi) => {
    try {
      const res = await axios.post<ReportResponse>(
        `/api/report?staff=${id}`,
        data,
        {
          headers: {
            Authorization: localStorage.getItem("token") || "",
          },
        }
      );

      if (res.data.status === 401) {
        _thunkApi.dispatch(logout());
      }

      return res.data;
    } catch (error) {
      console.error("Add report error:", error);
      throw error; // Will be handled by `rejected` case in slice
    }
  }
);
export const editReport = createAsyncThunk(
  "/report/edit",
  async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
    console.log("data==================================================", data);
    try {
      const res = await axios.patch(`/api/report?id=${id}`, data, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      return res.data;
    } catch (error) {
      console.error(error);
    }
  }
);

export const deleteReport = createAsyncThunk(
  "/report/deleteReport",
  async (id: string, _thunkApi) => {
    try {
      const res = await axios.delete(`/api/report?id=${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (res.data.status === 401) {
        _thunkApi.dispatch(logout());
      }
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getReports = createAsyncThunk(
  "schedule/getReports",
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
      const res = await axios.get("/api/report", {
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
      console.log(res);
      if (res.data.status == 401) {
        _thunkApi.dispatch(logout());
      }
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getPatientForReport = createAsyncThunk(
  "schedule/getPatientForReport",
  async (obj: { staffId: string; date: string }, _thunkApi) => {
    try {
      const res = await axios.get(
        `/api/getPatientForReport?staffId=${obj.staffId}&date=${obj.date}`,
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
