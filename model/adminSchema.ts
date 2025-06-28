import mongoose from "mongoose";

const Schema = mongoose.Schema;

const adminSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  flatNo: String,
  area: String,
  city: String,
  state: String,
  zipCode: String,
  sessionCharge: Number,
  password: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["admin", "staff"],
  },
  profileImage: {
    type: String,
    default: "",
  },
  otp: String,
});

if (mongoose.models.Admin_Staff) {
  delete mongoose.models.Admin_Staff;
}
export default mongoose.model("Admin_Staff", adminSchema);
