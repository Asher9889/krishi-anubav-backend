import express from "express";
import upload from "./multer.config";
import UploadController from "./upload.controller";
import { uploadController } from "./upload.module";

const router = express.Router();

router.post("/avatar", upload.single("avatar"), uploadController.uploadAvatar);

export default router;