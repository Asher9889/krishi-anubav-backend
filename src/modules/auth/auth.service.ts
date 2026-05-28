import { StatusCodes } from "http-status-codes";
import { ApiError, generateJWTToken } from "../../utils";
import { UserModel } from "./auth.model";
import { envConfig, logger } from "../../config";
import axios from "axios";



class AuthService {
    
    sendOTP = async (phone:string) => {        
        try {
            console.log(`Attempting to send OTP to phone number: ${phone}, url: ${envConfig.msg91SendSmsApiUrl}, widgetId: ${envConfig.msg91WidgetId}, authKey: ${envConfig.msg91AuthToken}`);

            const response = await axios.request({
                baseURL: envConfig.msg91SendSmsApiUrl,
                method: "POST",
                data: {
                    widgetId: envConfig.msg91WidgetId,
                    identifier: phone,
                },
                headers: {
                    "authkey": envConfig.msg91AuthToken,
                    "Content-Type": "application/json",
                }
            });
            return response.data;
           
        } catch (error: any) {
            logger.error("Error occurred while sending OTP:", error.message);
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.response?.data?.message || error.response?.data || "Failed to send OTP");
        }
    }


    registerUser = async (name: string, email: string, password: string) => {
        try {
            const existingUser = await UserModel.findOne({ email }).lean();
            if (existingUser) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "User already exists");
            }

            const user = await UserModel.create({ name, email, password });
            if (!user) {
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create user");
            }
            return { id: user._id, email: user.email, name: user.name };
        } catch (error) {
            throw error;
        }
    }

    loginUser = async (email: string, password: string) => {
        try {

            const user = await UserModel.findOne({ email }).select("+password");
            if (!user) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found. Please register first.");
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
            }
            const userId = user._id.toString();
            const token = generateJWTToken(userId);

            return {
                token,
                user: {
                    id: userId,
                    email: user.email,
                    name: user.name,
                },
            };
        } catch (error) {
            throw error;
        }
    }
}

export default AuthService;