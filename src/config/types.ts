interface IEnvConfig {
    port: string | number;
    mongodbUsername: string;
    mongodbPassword: string;
    mongodbCluster: string;
    mongodbDbName: string;
    mongodbConnectionString: string;

    jwtSecret: string;

    msg91WidgetId: string;
    msg91AuthToken: string;
    msg91SendSmsApiBaseUrl: string;

}


export default IEnvConfig;