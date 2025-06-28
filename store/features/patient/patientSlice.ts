import { createSlice } from "@reduxjs/toolkit";
import { patient } from "@/app/admin/patient-detail/page";
import {
  addPatient,
  getPatient,
  deletePatient,
  getPatientById,
} from "./patientAction";

const initialState = {
  patient: [],
  total: 0,
  totalPages: 1,
  isLoading: false,
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //add patient details

    builder.addCase(addPatient.pending, (state) => {
      console.log("api pendingg");
      state.isLoading = true;
    });

    builder.addCase(addPatient.fulfilled, (state) => {
      state.isLoading = false;
    });

    //Geting patient details

    builder.addCase(getPatient.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getPatient.fulfilled, (state, action) => {
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
      state.patient = action.payload.patient?.filter(
        (elem: patient) => elem.role !== "admin"
      );
      state.isLoading = false;
    });

    //delete patient data

    builder.addCase(deletePatient.fulfilled, (state, action) => {
      state.patient = state.patient?.filter(
        (elem: patient) => elem._id !== action.payload.id
      );
    });

    //get patient details by id
    builder.addCase(getPatientById.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(getPatientById.fulfilled, (state) => {
      state.isLoading = false;
    });
  },
});

export default patientSlice.reducer;
