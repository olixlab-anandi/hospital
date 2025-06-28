import mongoose from "mongoose";

const connection = async () => {
  mongoose
    .connect(process.env.MONGODB_URL as string)
    .then(() => {
      console.log("Database Connected");
    })
    .catch((err) => {
      console.log("Error in connection", err);
    });
};

export default connection;
