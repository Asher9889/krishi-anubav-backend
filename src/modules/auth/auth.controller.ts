import { NextFunction, Request, Response } from "express";
import { TRegister } from "./auth.types";
import AuthService from "./auth.service";
import { ApiResponse } from "../../utils";
import { StatusCodes } from "http-status-codes";

class AuthController {
    authService: AuthService;
    constructor(authService: AuthService) {
        this.authService = authService;
    }

    sendOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { phone } = req.body;
            console.log(`Received request to send OTP to phone number: ${phone}`);
            const result = await this.authService.sendOTP(phone);
            return ApiResponse.success(res, StatusCodes.OK, "OTP sent successfully", result);
        } catch (error) {
            console.error("Error occurred while sending OTP:", error);
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