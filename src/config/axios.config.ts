import axios from "axios";
import envConfig from "./env.config";





const otpApi = axios.create({
    baseURL: envConfig.msg91SendSmsApiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    }
})

export default otpApi;