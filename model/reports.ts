import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_staffs",
    },
    date: String,
    healthStatus: String,
    currentCondition: String,
    suggestions: String,
    reportFile: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);
if (mongoose.models.report) {
  delete mongoose.models.report;
}
export default mongoose.model("report", reportSchema);
