import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../../utils";
import UserService from "./user.service";

class UserController {
    userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
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
}

export default UserController;