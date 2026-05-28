import IEnvConfig from "./types";

const envConfig:IEnvConfig = {
    port: Number(process.env.PORT || 3000),

    // database
    mongodbUsername: process.env.MONGODB_USERNAME!,
    mongodbPassword: encodeURIComponent(process.env.MONGODB_PASSWORD!),
    mongodbCluster: process.env.MONGODB_CLUSTER!,
    mongodbDbName: process.env.MONGODB_DB_NAME!,
    mongodbConnectionString: process.env.MONGODB_CONNECTION_STRING!,

    msg91WidgetId: process.env.MSG91_WIDGET_ID!,
    msg91AuthToken: process.env.MSG91_AUTH_KEY!,
    msg91SendSmsApiUrl: process.env.MSG91_SEND_SMS_API_URL!,


    // jwt
    jwtSecret: process.env.JWT_SECRET!
}

export default envConfig;