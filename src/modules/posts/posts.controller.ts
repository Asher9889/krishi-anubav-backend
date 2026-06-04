import { NextFunction, Request, Response } from "express";
import PostsService from "./posts.service";
import { TCreatePostPayloadDTO, TGetPostsPayload } from "./posts.types";
import { ApiError, ApiResponse } from "../../utils";
import { StatusCodes } from "http-status-codes";



class PostsController {
    postsService: PostsService; // Replace with actual service type

    constructor(postsService: PostsService) {
        this.postsService = postsService;
    }


    createPost = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const userId = req.user?.id; // Assuming user ID is available in the request object after authentication
            if (!userId) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            }
            const postData = req.body as TCreatePostPayloadDTO; // Assuming post data is sent in the request body
            const images = req.files as Express.Multer.File[]; // Assuming images are uploaded using multer

            console.log("Received post data:", postData);
            console.log("Received images:", images);

            const { success } = await this.postsService.createPost({ userId, postData, images });
            return ApiResponse.success(res, StatusCodes.OK, "Post created successfully", { success });

        } catch (error) {
            return next(error);
        }
    }

    getPosts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const body = req.body as TGetPostsPayload;
            const userId = req.user?.id; // Assuming user ID is available in the request object after authentication

            if (!userId) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            }
            const posts = await this.postsService.getPosts({userId, body});
            return ApiResponse.success(res, StatusCodes.OK, "Posts retrieved successfully", posts); // Placeholder response
        } catch (error) {
            return next(error);
        }
    }
}

export default PostsController;