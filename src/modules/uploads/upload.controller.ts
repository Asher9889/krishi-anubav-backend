import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils";
import UploadService from "./upload.service";
import { NextFunction, Request, Response } from "express";

class UploadController {
    uploadService: UploadService;

    constructor(uploadService: UploadService) {
        this.uploadService = uploadService;
    }

    uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file;
            const userId: string = req.body.userId;

            if (!file) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "No file uploaded");
            }

            if(!userId) {
                throw new ApiError(StatusCodes.FORBIDDEN, "Please provide valid userId to upload avatar");
            }

            const data = await this.uploadService.uploadAvatar(file, userId, "avatar");

            return res.status(200).json({ message: "Avatar uploaded successfully", data });
        } catch (error) {
            console.error("Error uploading avatar:", error);
            next(error);
        }
    }
}

export default UploadController;