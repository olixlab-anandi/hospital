import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  age: Number,
  phone: Number,
  location: String,
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin_Staff",
  },
  profileImage: String,
  flatNo: String,
  area: String,
  city: String,
  state: String,
  zipCode: String,
  bloodGroup: String,
  diagnosed: String,
  primaryDoctor: String,
  medicalHistory: String,
  role: {
    type: String,
    enum: ["patient"],
    default: "patient",
  },
  registered: {
    type: String,
  },
});
if (mongoose.models.patient) {
  delete mongoose.models.patient;
}

const patientModel = mongoose.model("patient", patientSchema);
export default patientModel;
