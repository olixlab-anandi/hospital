import { createSlice } from "@reduxjs/toolkit";
import { addStaff, deleteStaff, getStaff } from "./adminActions";
import { staff } from "@/app/admin/staff-details/page";

const initialState = {
  isLoading: false,
  staff: [],
  totalPages: 1,
  activeTab: "home",
  total: 1,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      console.log("setActiveTab called with payload:", action.payload);
      state.activeTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    //add staff details

    builder.addCase(addStaff.pending, (state) => {
      console.log("api pendingg");
      state.isLoading = true;
    });

    builder.addCase(addStaff.fulfilled, (state) => {
      state.isLoading = false;
    });

    //Geting staff details

    builder.addCase(getStaff.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getStaff.fulfilled, (state, action) => {
      state.staff = action.payload.staff?.filter(
        (elem: staff) => elem.role !== "admin"
      );
      state.totalPages = action.payload.totalPages;
      state.total = action.payload.total;
      state.isLoading = false;
    });

    //delete staff data

    builder.addCase(deleteStaff.fulfilled, (state, action) => {
      state.staff = state.staff.filter(
        (elem: staff) => elem._id !== action.payload.id
      );
    });
  },
});

export default adminSlice.reducer;
export const { setActiveTab } = adminSlice.actions;
