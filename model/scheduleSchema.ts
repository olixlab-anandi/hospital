import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin_Staff",
      required: true,
      default: "",
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
    },
    Date: String,
    EndDate: String,
    StartTime: String,
    EndTime: String,
    Fees: Number,
    Location: String,
    Notes: String,
    Status: String,
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Schedule) {
  delete mongoose.models.Schedule;
}
const scheduleModel =
  mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);

export default scheduleModel;
