import axios from "axios";
import envConfig from "./env.config";





const otpApi = axios.create({
    baseURL: envConfig.msg91SendSmsApiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    }
})

const aiApi = axios.create({
    baseURL: envConfig.aiApiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    }
})

const translationApi = axios.create({
    baseURL: envConfig.translationApiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    }
})

export {  aiApi, translationApi };

export default otpApi;