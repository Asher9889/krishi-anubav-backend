import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError, ApiResponse } from "../../utils";
import FollowService from "./follow.service";

class FollowController {
    followService: FollowService;

    constructor(followService: FollowService) {
        this.followService = followService;
    }

    follow = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUserId = req.user?.id;
            if (!currentUserId) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            }

            const userId = req.params.userId as string;
            const result = await this.followService.follow(currentUserId, userId);
            return ApiResponse.success(res, StatusCodes.OK, "Followed successfully", result);
        } catch (error) {
            return next(error);
        }
    }

    unfollow = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUserId = req.user?.id;
            if (!currentUserId) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            }

            const userId = req.params.userId as string;
            const result = await this.followService.unfollow(currentUserId, userId);
            return ApiResponse.success(res, StatusCodes.OK, "Unfollowed successfully", result);
        } catch (error) {
            return next(error);
        }
    }

    getFollowers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.userId as string;
            const currentUserId = req.user?.id;
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

            const result = await this.followService.getFollowers(userId, currentUserId || "", page, limit);
            return ApiResponse.success(res, StatusCodes.OK, "Followers fetched successfully", result);
        } catch (error) {
            return next(error);
        }
    }

    getFollowing = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.userId as string;
            const currentUserId = req.user?.id;
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

            const result = await this.followService.getFollowing(userId, currentUserId || "", page, limit);
            return ApiResponse.success(res, StatusCodes.OK, "Following fetched successfully", result);
        } catch (error) {
            return next(error);
        }
    }
}

export default FollowController;
