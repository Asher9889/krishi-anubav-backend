import { S3Client } from "@aws-sdk/client-s3";
import { envConfig } from "../../config";

const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: envConfig.minioEndpoint,        // e.g. "http://160.25.62.109:9000"
    credentials: {
        accessKeyId: envConfig.minioAccessKey,
        secretAccessKey: envConfig.minioSecretKey,
    },
    forcePathStyle: true,
});

export default s3Client;