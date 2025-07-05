import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { logout } from "../auth/authSlice";
import { toast } from "react-toastify";

export const addStaff = createAsyncThunk(
  "admin/add-staff",
  async (obj: Form, _thunkApi) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/staff", obj, {
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

interface getStaffProps {
  searchVal?: string;
  page?: number;
}
export const getStaff = createAsyncThunk(
  "/admin/getStaff",
  async (obj: getStaffProps, _thunkApi) => {
    const { searchVal, page } = obj;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `/api/staff?searchVal=${searchVal}&page=${page}`,
        {
          headers: {
            Authorization: token,
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

export const deleteStaff = createAsyncThunk(
  "/admin/deleteStaff",
  async (id: string, _thunkApi) => {
    try {
      const res = await axios.delete(`/api/staff?id=${id}`);

      if (res.data.status == 401) {
        _thunkApi.dispatch(logout());
      }
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

interface editStaffProps {
  id: string;
  data: FormData;
}

export const editStaff = createAsyncThunk(
  "/admin/editStaff",
  async (obj: editStaffProps, _thunkApi) => {
    const token = localStorage.getItem("token");
    try {
      const { id, data } = obj;
      const res = await axios.patch(`/api/staff?id=${id}`, data, {
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
