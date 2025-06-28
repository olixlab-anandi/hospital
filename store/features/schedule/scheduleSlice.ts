import { createSlice } from "@reduxjs/toolkit";
import { addSchedule, deleteSchedule, getSchedule } from "./scheduleActions";

const initialState = {
  schedule: [],
  isLoading: false,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addSchedule.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(addSchedule.fulfilled, (state) => {
      state.isLoading = false;
    });

    builder.addCase(getSchedule.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getSchedule.fulfilled, (state, action) => {
      console.log("getSchedule fulfilled with payload:", action.payload);
      state.schedule = action.payload?.schedules;
      state.isLoading = false;
    });

    builder.addCase(deleteSchedule.pending, () => {});
    builder.addCase(deleteSchedule.fulfilled, (state, action) => {
      console.log("deleteSchedule fulfilled with payload:", action.payload);
      state.schedule = state.schedule?.filter(
        (schedule: Record<string, string>) => schedule._id !== action.payload.id
      );
    });
  },
});

export const {} = scheduleSlice.actions;

export default scheduleSlice.reducer;
