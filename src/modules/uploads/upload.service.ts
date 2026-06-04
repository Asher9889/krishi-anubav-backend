import { StatusCodes } from "http-status-codes";
import { envConfig } from "../../config";
import minioService from "../../shared/storage/s3.service";
import { ApiError } from "../../utils";
import { UserModel } from "../user";

import mongoose from "mongoose";

class UploadService {
    uploadAvatar = async (file: Express.Multer.File, userId: string, filename: string) => {
       try {
         const fileExtension = file.mimetype.split("/")[1];
         const objectKey = `avatars/${userId}/avatar-${Date.now()}.${fileExtension}`;
         await minioService.sendFileToMinio(file, objectKey);
         const publicUrl = minioService.generatePublicAccessUrl(objectKey);
         const userObjectId = new mongoose.Types.ObjectId(userId);
         console.log(`Updating user ${userObjectId} with new avatar URL: ${publicUrl}`);

         const result = await UserModel.updateOne({ _id: userObjectId }, { avatar: publicUrl }).exec();
         console.log(`MongoDB update result for user ${userObjectId}:`, result);
         if (result.modifiedCount === 0) {
          throw new ApiError(StatusCodes.NOT_FOUND, "User not found. Unable to update avatar URL.");
         }
         return { url: publicUrl };
       } catch (error: any) {
        if(error instanceof ApiError) {
          throw error; 
        }
         console.error("Error in uploadAvatar service:", error);
         throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || "Failed to upload avatar");
       }
    }
}

export default UploadService;