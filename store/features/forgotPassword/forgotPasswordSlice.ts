import { createSlice } from "@reduxjs/toolkit";
import { resetPass, sendEmail, verifyOtp } from "./forgotPasswordActions";

const initialState = {
  isLoading: false,
  step: 1,
};

const forgotPassSlice = createSlice({
  name: "forgotpass",
  initialState,
  reducers: {
    setIntialStep: (state) => {
      state.step = 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendEmail.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(sendEmail.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) state.step = 2;
    });

    builder.addCase(verifyOtp.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) state.step = 3;
    });

    builder.addCase(resetPass.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(resetPass.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) state.step = 4;
    });
  },
});

export default forgotPassSlice.reducer;
export const { setIntialStep } = forgotPassSlice.actions;
