import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils";
import { PostModel } from "../posts/post.model";
import FollowModel from "../follow/follow.model";
import { TFeedPost, TFeedQuery } from "./feed.types";
import mongoose from "mongoose";
import { logger } from "../../config";
import PostLikeModel from "../post-like/post-like.model";

class FeedService {

    getFeed = async (userId: string, query: TFeedQuery): Promise<{ posts: TFeedPost[]; nextCursor: string | null; hasMore: boolean }> => {
        try {
            const { cursor, limit } = query;
            const filter: any = { isActive: true };

            if (cursor) {
                filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
            }

            const posts = await PostModel.find(filter).sort({ _id: -1 })
                .limit(limit + 1) // Fetch one extra to check if there's a next page
                .lean();

            const postIds = posts.map(post => post._id);

            const likedPosts = await PostLikeModel.find({
                userId,
                postId: {
                    $in: postIds,
                },
            }, { postId:1 }).lean();

            const likedPostIds = new Set(
                likedPosts.map(like => like.postId.toString())
            );

            console.log("Fetched posts for feed:", postIds); // Log the fetched post IDs for debugging

            logger.info(`Fetched ${posts.length} posts for feed with cursor: ${cursor} and limit: ${limit}`);

            const formatted: TFeedPost[] = posts.map((post) => ({
                id: post._id.toString(),
                userId: post.userId.toString(),
                name: post.name,
                location: post.location,
                state: post.state,
                district: post.district,
                knowledge: post.knowledge,
                images: post.images,
                likesCount: post.likesCount,
                commentsCount: post.commentsCount,
                isActive: post.isActive,
                isLiked: likedPostIds.has(post._id.toString()),
                createdAt: (post as any).createdAt?.toISOString?.() ?? "",
                updatedAt: (post as any).updatedAt?.toISOString?.() ?? "",
            }));

            const hasMore = formatted.length > limit;
            const nextCursor = hasMore ? formatted[limit - 1]!.id : null;
            if (formatted.length > limit) {
                formatted.pop(); // Remove the extra post used for checking next page
            }

            return { posts: formatted, nextCursor, hasMore };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch feed");
        }
    }
}

export default FeedService;
