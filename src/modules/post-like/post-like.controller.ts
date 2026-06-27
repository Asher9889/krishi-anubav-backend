import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError, ApiResponse } from "../../utils";
import PostLikeService from "./post-like.service";
import {TLikePostParams} from "./post-like.types";
class PostLikeController {
    postLikeService: PostLikeService;

    constructor(postLikeService: PostLikeService) {
        this.postLikeService = postLikeService;
    }

    likePost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            }

            const { postId } = req.validatedParams as TLikePostParams;
            const result = await this.postLikeService.likePost(postId, userId);
            return ApiResponse.success(res, StatusCodes.OK, "Post liked successfully", result);
        } catch (error) {
            return next(error);
        }
    }

    unlikePost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            }

            const postId = req.params.postId as string;
            const result = await this.postLikeService.unlikePost(postId, userId);
            return ApiResponse.success(res, StatusCodes.OK, "Post unliked successfully", result);
        } catch (error) {
            return next(error);
        }
    }

    getPostLikes = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const postId = req.params.postId as string;
            const currentUserId = req.user?.id ?? "";
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

            const result = await this.postLikeService.getPostLikes(postId, currentUserId, page, limit);
            return ApiResponse.success(res, StatusCodes.OK, "Post likes fetched successfully", result);
        } catch (error) {
            return next(error);
        }
    }

    getLikedPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.userId as string;
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

            const result = await this.postLikeService.getLikedPosts(userId, page, limit);
            return ApiResponse.success(res, StatusCodes.OK, "Liked posts fetched successfully", result);
        } catch (error) {
            return next(error);
        }
    }
}

export default PostLikeController;
