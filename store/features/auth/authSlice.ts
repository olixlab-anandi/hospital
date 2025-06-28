import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { login, updateProfile } from "./authActions";

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  role: "",
  user: {
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: "",
    role: "",
    flatNo: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    sessionCharge: 0,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = "";
      state.user = {
        _id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        profileImage: "",
        role: "",
        flatNo: "",
        area: "",
        city: "",
        state: "",
        zipCode: "",
        sessionCharge: 0,
      };
      Cookies.set("isAuthenticated", String(state.isAuthenticated));
      Cookies.remove("role");
      localStorage.clear();
    },

    setAuthentication: (state, action) => {
      state.isAuthenticated = action.payload.success;
      state.role = action.payload.role;
      state.user = action.payload.user;
      Cookies.set("isAuthenticated", String(state.isAuthenticated));
      Cookies.set("role", state.role);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(login.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(login.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });
  },
});

export const { setAuthentication, logout } = authSlice.actions;
export default authSlice.reducer;
