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
            console.log("Received request to create post with body:", req.body); // Log the incoming request body for debugging
            console.log("Received files for post creation:", req.files); // Log the incoming files for debugging
            const userId = req.user?.id; // Assuming user ID is available in the request object after authentication
            if (!userId) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            }
            const postData = req.body as TCreatePostPayloadDTO; // Assuming post data is sent in the request body
            const images = req.files as Express.Multer.File[]; // Assuming images are uploaded using multer

            const { success } = await this.postsService.createPost({ userId, postData, images });
            return ApiResponse.success(res, StatusCodes.OK, "Post created successfully", { success });

        } catch (error) {
            return next(error);
        }
    }

    getPosts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const query = req.query as unknown as TGetPostsPayload; // Assuming query parameters are sent in the request query

            console.log("Received query parameters for getPosts:", query); // Log the received query parameters for debugging

            const userId = req.user?.id; // Assuming user ID is available in the request object after authentication

            if (!userId) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            }
            const posts = await this.postsService.getPosts({userId, query});
            return ApiResponse.success(res, StatusCodes.OK, "Posts retrieved successfully", posts); // Placeholder response
        } catch (error) {
            return next(error);
        }
    }

    getFeaturedPosts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // const userId = req.user?.id; // Assuming user ID is available in the request object after authentication

            // if (!userId) {
            //     throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            // }
            const posts = await this.postsService.getFeaturedPosts();
            return ApiResponse.success(res, StatusCodes.OK, "Featured posts retrieved successfully", posts); // Placeholder response
        } catch (error) {
            return next(error);
        }
    }
}

export default PostsController;