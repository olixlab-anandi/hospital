// utils/multerCloudinary.ts
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../../../../cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "Profile",
    allowed_formats: ["jpg", "png", "svg", "jpeg"],
  }),
});

const upload = multer({ storage });

export default upload;
