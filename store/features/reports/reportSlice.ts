import { createSlice } from "@reduxjs/toolkit";
import { addReport, deleteReport, getReports } from "./reportsAction";

const initialState = {
  reports: [],
  isLoading: false,
};

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addReport.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(addReport.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(getReports.fulfilled, (state, action) => {
      state.reports = action.payload.report;
    });

    //delete report

    builder.addCase(deleteReport.pending, () =>
      console.log("delete pi pending")
    );

    builder.addCase(deleteReport.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.reports = state.reports?.filter((elem: { _id: string }) => {
          return elem._id !== action.payload.id;
        });
      }
    });
  },
});

export default reportSlice.reducer;
