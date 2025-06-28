import axios from "axios";
import schedule from "node-schedule";
import dotenv from "dotenv";
dotenv.config();

const schedules = () => {
  console.log(
    "cron job is running-=============================================",
    `${process.env.SITE_URL}/api/carry-schedule`
  );
  schedule.scheduleJob("22 10 * * *", async () => {
    console.log("functiona called");
    try {
      const res = await axios.post(
        `${process.env.SITE_URL}/api/carry-schedule`
      );
      console.log("carry forworded");
      return res;
    } catch (error) {
      console.log(error);
    }
  });
};
export default schedules;
