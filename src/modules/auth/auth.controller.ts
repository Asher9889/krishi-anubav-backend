import { NextFunction, Request, Response } from "express";
import { MeResponse, TRegister, TRefreshToken, TVerifyOTP } from "./auth.types";
import AuthService from "./auth.service";
import { ApiError, ApiResponse } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../config";

class AuthController {
    authService: AuthService;
    constructor(authService: AuthService) {
        this.authService = authService;
    }

    sendOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { phone } = req.body;
            logger.info(`Received request to send OTP to phone number: ${phone}`);
            const { message, type} = await this.authService.sendOTP(phone);
            return ApiResponse.success(res, StatusCodes.OK, "OTP sent successfully", { reqId: message, type });
        } catch (error) {
            logger.error("Error occurred while sending OTP:"+ error);
            return next(error);
        }
    }
    
    verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { reqId, otp, phone } = req.body as TVerifyOTP;
            logger.info(`Received request to verify OTP for phone number: ${phone}, request ID: ${reqId} with OTP: ${otp}`);
            const { tokens: {accessToken, refreshToken}, user } = await this.authService.verifyOTP(req.body);
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1 * 60 * 60 * 1000, // 1 hour
            });

            logger.info(`OTP verified for phone: ${phone}, user ID: ${user.id} and response is: ${JSON.stringify({ user, tokens: { accessToken, refreshToken }})}`);

            return ApiResponse.success(res, StatusCodes.OK, "OTP verified successfully", {user, tokens: { accessToken, refreshToken }});
        } catch (error) {
            logger.error("Error occurred while verifying OTP:" + error);
            return next(error);
        }
    }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body as TRefreshToken;
            const result = await this.authService.refreshToken(refreshToken);
            return ApiResponse.success(res, StatusCodes.OK, "Token refreshed successfully", result);
        } catch (error) {
            logger.error("Error occurred while refreshing token:" + error);
            return next(error);
        }
    }

    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const phone = req.user?.phone;

            if (!phone) {
                return next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized"));
            }

            const user = await this.authService.getCurrentUser(phone);
            return ApiResponse.success(res, StatusCodes.OK, "User fetched successfully", {user});
        } catch (error) {
            logger.error("Error occurred while fetching current user:" + error);
            return next(error);
        }
    }

    registerUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, name } = req.body as TRegister;
            const result = await this.authService.registerUser(name, email, password);
            return ApiResponse.success(res, StatusCodes.CREATED, "User registered successfully", result);
        } catch (error) {
            return next(error);
        }
    };

    loginUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.loginUser(email, password);
            return ApiResponse.success(res, StatusCodes.OK, "Login successful", result);
        } catch (error) {
            return next(error);
        }
    }
}

export default AuthController;