import { StatusCodes } from "http-status-codes";
import { ApiError, generateJWTToken } from "../../utils";
import { UserModel } from "../user";
import { envConfig, logger, otpApi } from "../../config";
import apiEndPoints from "../../config/apiEndPoints";
import jwt from "jsonwebtoken";
import { MeResponse, TVerifyOTP, TVerifyOTPResponse } from "./auth.types";
import { TJwtPayloadToken } from "../user/user.types";



class AuthService {

    sendOTP = async (phone: string): Promise<{ message: string; type: string }> => {
        try {
            console.log(`Attempting to send OTP to phone number: ${phone}, url: ${envConfig.msg91SendSmsApiBaseUrl}, widgetId: ${envConfig.msg91WidgetId}, authKey: ${envConfig.msg91AuthToken}`);
            const { url, method } = apiEndPoints.auth.sendOTP
            const response = await otpApi.request({
                url,
                method,
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

    refreshToken = async (refreshToken: string): Promise<TVerifyOTPResponse> => {
        try {
            const payload = jwt.verify(refreshToken, envConfig.jwtRefreshTokenSecret) as TJwtPayloadToken;

            const user = await UserModel.findOne({ phone: payload.phone });

            if (!user?._id) {
                throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
            }

            const tokens = user.generateJWTToken();

            return {
                user: {
                    id: user._id.toString(),
                    phone: user.phone,
                },
                tokens,
            };
        } catch (error: any) {
            if(error instanceof jwt.TokenExpiredError) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "Your token has expired. Please log in again.");
            }
            if(error instanceof jwt.JsonWebTokenError) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token. Please log in again.");
            }
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(StatusCodes.UNAUTHORIZED, error?.message || "Invalid or expired refresh token");
        }
    }

    getCurrentUser = async (phone: string): Promise<MeResponse> => {
        try {
            const user = await UserModel.findOne({ phone }).lean();

            if (!user?._id) {
                throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
            }

            const Retureduser =  {
                id: user._id.toString(),
                fullName: user.fullName ?? null,
                username: user.username ?? null,
                phone: user.phone,
                role: user.role,
                bio: user.bio ?? null,
                gender: user.gender ?? null,
                occupation: user.occupation ?? null,
                avatar: user.avatar ?? null,
                village: user.address?.line2 ?? null,
                district: user.address?.district ?? null,
                state: user.address?.state ?? null,
                createdAt: user.createdAt,
            };
            return Retureduser;
        } catch (error: any) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error?.message || "Failed to fetch user profile");
        }
    }

    verifyOTP = async ({ reqId, otp, phone }: TVerifyOTP): Promise<TVerifyOTPResponse> => {
        try {
            // console.log(`Attempting to verify OTP for phone number: ${phone} with OTP: ${otp}, url: ${envConfig.msg91VerifyOtpApiUrl}, widgetId: ${envConfig.msg91WidgetId}, authKey: ${envConfig.msg91AuthToken}`);
            const { url, method } = apiEndPoints.auth.verifyOTP;

            // 1. verify the otp
            const response = await otpApi.request({
                url,
                method,
                data: {
                    widgetId: envConfig.msg91WidgetId,
                    reqId,
                    otp,
                },
                headers: {
                    "authkey": envConfig.msg91AuthToken,
                }
            });

            if (response.data.code === 703) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Otp already verifed");
            }


            if (response.data.type !== "success") {
                console.log("OTP verification failed with response:", response.data);
                throw new ApiError(StatusCodes.BAD_REQUEST, response.data.message || "OTP verification failed");
            }

            // 2. create an user if not exists with the phone number.
            const PhoneString = String(phone);
            const isAlreadyRegistered = await UserModel.findOne({ phone: PhoneString });

            // 4. if user not registered, create a new user and generate a token and return
            if (!isAlreadyRegistered?._id) {
                const newUser = await UserModel.create({ phone: PhoneString, isPhoneVerified: true });
                if (!newUser._id) {
                    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create user");
                }

                const jwtTokens = newUser.generateJWTToken();

                return {
                    user: {
                        id: newUser._id.toString(),
                        phone: newUser.phone,
                    },
                    tokens: jwtTokens
                };
            }

            // 3. if user already registered, generate a token and return

            const jwtTokens = isAlreadyRegistered.generateJWTToken();
            return {
                user: {
                    id: isAlreadyRegistered._id.toString(),
                    phone: isAlreadyRegistered.phone,
                },
                tokens: jwtTokens
            };



        } catch (error) {
            throw error;
        }
    }

    registerUser = async (name: string, email: string, password: string) => {
        try {
            // const existingUser = await UserModel.findOne({ email }).lean();
            // if (existingUser) {
            //     throw new ApiError(StatusCodes.BAD_REQUEST, "User already exists");
            // }

            // const user = await UserModel.create({ name, email, password });
            // if (!user) {
            //     throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create user");
            // }
            // return { id: user._id, email: user.email, name: user.name };
        } catch (error) {
            throw error;
        }
    }

    loginUser = async (email: string, password: string) => {
        try {

            // const user = await UserModel.findOne({ email }).select("+password");
            // if (!user) {
            //     throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found. Please register first.");
            // }
            // const isPasswordValid = await user.comparePassword(password);
            // if (!isPasswordValid) {
            //     throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
            // }
            // const userId = user._id.toString();
            // const token = generateJWTToken(userId);

            // return {
            //     token,
            //     user: {
            //         id: userId,
            //         email: user.email,
            //         name: user.name,
            //     },
            // };
        } catch (error) {
            throw error;
        }
    }
}

export default AuthService;