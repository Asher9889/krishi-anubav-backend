import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError, ApiResponse } from "../../utils";
import UserService from "./user.service";
import { TUpdateUserRequest, TUserId } from "./user.types";
import { logger } from "../../config";

class UserController {
    userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.validatedParams as TUserId;
            const loggedInUserId = req.user?.id; // Assuming you have a middleware that sets req.user for authenticated users
            logger.info(`Received request to fetch user profile for user ID: ${userId} by logged-in user ID: ${loggedInUserId}`);
            if (!loggedInUserId) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            }
            const user = await this.userService.getUserProfile(loggedInUserId, userId);
            return ApiResponse.success(res, StatusCodes.OK, "User fetched successfully", { user });
        } catch (error) {
            return next(error);
        }
    }

    checkUsernameAvailability = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const username = req.query.username as string;

            const result = await this.userService.checkUsernameAvailability(username);

            return ApiResponse.success(res, StatusCodes.OK, "Username availability fetched successfully", result);
        } catch (error) {
            return next(error);
        }
    };

    updateMe = async (req: Request, res: Response, next: NextFunction) => {
        logger.info(`Received request to update user profile for user ID: ${req.user?.id} with data: ${JSON.stringify(req.body)}`);
        try {
            const id = req.user?.id as string;
            const result = await this.userService.updateMe(id, req.body as TUpdateUserRequest);

            return ApiResponse.success(res, StatusCodes.OK, "User updated successfully", result);
        } catch (error) {
            return next(error);
        }
    };
}

export default UserController;