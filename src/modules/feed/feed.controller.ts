import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError, ApiResponse } from "../../utils";
import FeedService from "./feed.service";
import { TFeedQuery } from "./feed.types";
import { logger } from "../../config";

class FeedController {
    feedService: FeedService;

    constructor(feedService: FeedService) {
        this.feedService = feedService;
    }

    getFeed = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated");
            }
            const query = req.validatedQuery as unknown as TFeedQuery;
            logger.info(`Received request to fetch feed with query: ${JSON.stringify(userId)}`); // Log the received query parameters for debugging
            const result = await this.feedService.getFeed(userId,query);
            return ApiResponse.success(res, StatusCodes.OK, "Feed fetched successfully", result);
        } catch (error) {
            return next(error);
        }
    }
}

export default FeedController;
