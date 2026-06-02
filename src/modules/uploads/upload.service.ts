import { StatusCodes } from "http-status-codes";
import { envConfig } from "../../config";
import minioService from "../../shared/storage/s3.service";
import { ApiError } from "../../utils";



class UploadService {
    uploadAvatar = async (file: Express.Multer.File, userId: string, filename: string) => {
       try {
         const fileExtension = file.mimetype.split("/")[1];
         const objectKey = `avatars/${userId}/avatar.${fileExtension}`;
         await minioService.sendFileToMinio(file, objectKey);
         const publicUrl = minioService.generatePublicAccessUrl(objectKey);
         return { url: publicUrl };
       } catch (error: any) {
            console.error("Error in uploadAvatar service:", error);
         throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || "Failed to upload avatar");
       }
    }
}

export default UploadService;