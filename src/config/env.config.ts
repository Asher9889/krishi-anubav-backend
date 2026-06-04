import IEnvConfig from "./types";

const envConfig:IEnvConfig = {
    port: Number(process.env.PORT || 3000),

    // database
    mongodbUsername: process.env.MONGODB_USERNAME!,
    mongodbPassword: encodeURIComponent(process.env.MONGODB_PASSWORD!),
    mongodbCluster: process.env.MONGODB_CLUSTER!,
    mongodbDbName: process.env.MONGODB_DB_NAME!,
    mongodbConnectionString: process.env.MONGODB_CONNECTION_STRING!,

    // msg91
    msg91WidgetId: process.env.MSG91_WIDGET_ID!,
    msg91AuthToken: process.env.MSG91_AUTH_KEY!,
    msg91SendSmsApiBaseUrl: process.env.MSG91_SEND_SMS_API_URL!,

    // Ai
    aiApiBaseUrl: process.env.AI_API_BASE_URL!,


    // jwt
    jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET!,
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET!,

    // minio
    minioEndpoint: process.env.MINIO_ENDPOINT!,
    minioAccessKey: process.env.MINIO_ACCESS_KEY!,
    minioSecretKey: process.env.MINIO_SECRET_KEY!,
    bucketName: process.env.MINIO_BUCKET_NAME!,
}

export default envConfig;