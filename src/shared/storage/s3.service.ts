import { PutObjectCommand, PutObjectCommandOutput } from "@aws-sdk/client-s3";
import s3Client from "./s3.client";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { envConfig } from "../../config";

class MinioService {
    sendFileToMinio = async (file: Express.Multer.File, key: string, bucketName: string="krishi-anubhav",): Promise<void | PutObjectCommandOutput> => {
        try {
            const params = {
                Bucket: bucketName, 
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            const result = await s3Client.send(new PutObjectCommand(params));

            console.log("Minio upload result:", result);

            if (result.$metadata.httpStatusCode !== 200) {
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to upload file to Minio");
            } 

            return result;
        } catch (error) {
            console.error("Error uploading file to Minio:", error);
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to upload file to Minio");
        }
    }

    generatePublicAccessUrl = (key: string, bucketName: string = envConfig.bucketName): string => {
        // Assuming the Minio server is configured to allow public access to the bucket
        return `${envConfig.minioEndpoint}/${bucketName}/${key}`;
    }

}

const minioService =   new MinioService();

export default minioService;