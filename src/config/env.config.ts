import IEnvConfig from "./types";

const envConfig:IEnvConfig = {
    port: Number(process.env.PORT || 3000),

    // database
    mongodbUsername: process.env.MONGODB_USERNAME!,
    mongodbPassword: encodeURIComponent(process.env.MONGODB_PASSWORD!),
    mongodbCluster: process.env.MONGODB_CLUSTER!,
    mongodbDbName: process.env.MONGODB_DB_NAME!,

    // jwt
    jwtSecret: process.env.JWT_SECRET!
}

export default envConfig;