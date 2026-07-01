interface IEnvConfig {
    port: string | number;
    mongodbUsername: string;
    mongodbPassword: string;
    mongodbCluster: string;
    mongodbDbName: string;
    mongodbConnectionString: string;

    // minio
    minioEndpoint: string;
    minioAccessKey: string;
    minioSecretKey: string;
    bucketName: string;

    //jwt
    jwtAccessTokenSecret: string;
    jwtRefreshTokenSecret: string;

    // msg91
    msg91WidgetId: string;
    msg91AuthToken: string;
    msg91SendSmsApiBaseUrl: string;

    //Ai
    aiApiBaseUrl: string;

    // translation
    translationApiBaseUrl: string;

}


export default IEnvConfig;