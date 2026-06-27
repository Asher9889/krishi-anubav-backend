import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils";
import PostLikeModel from "./post-like.model";
import PostModel from "../posts/post.model";
import { UserModel } from "../user";
import { TLikeUser, TPostLikesResponse, TLikedPostsResponse } from "./post-like.types";
import { logger } from "../../config";
import mongoose from "mongoose";

class PostLikeService {

    likePost = async (postId: string, userId: string): Promise<{ liked: boolean }> => {
        const session = await mongoose.startSession();
        try {
            const post = await PostModel.findById(postId).lean();
            if (!post) {
                throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
            }

            // const existing = await PostLikeModel.findOne({ postId, userId });
            // if (existing) {
            //     throw new ApiError(StatusCodes.CONFLICT, "Already liked this post");
            // }

            logger.info(`User ${userId} is liking post ${postId}`); // Log the like action for debugging

            session.startTransaction();
            await PostLikeModel.create([{ postId, userId }], { session });
            await PostModel.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } }, { session });
            await session.commitTransaction();
            return { liked: true };
        } catch (error: any) {
            console.error("Error in likePost:", error); // Log the error for debugging
            await session.abortTransaction();
            if (error instanceof ApiError) {
                throw error;
            }
            if (error.code === 11000) { // Duplicate key error
                throw new ApiError(StatusCodes.CONFLICT, "Already liked this post");
            }
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || "Failed to like post");
        } finally {
            await session.endSession();
        }
    }

    unlikePost = async (postId: string, userId: string): Promise<{ liked: boolean }> => {
        const session = await mongoose.startSession();
        try {
            const existing = await PostLikeModel.findOne({ postId, userId }).lean();

            if (!existing) {
                throw new ApiError(StatusCodes.NOT_FOUND, "You have not liked this post");
            }

            session.startTransaction();
            await PostLikeModel.findOneAndDelete({ postId, userId });
            await PostModel.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } }, { session });
            await session.commitTransaction();

            return { liked: false };
        }catch (error: any) {
            console.error("Error in unlikePost:", error); // Log the error for debugging
            await session.abortTransaction();
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || "Failed to unlike post");
        }finally {
            await session.endSession();
        }
    }

    getPostLikes = async (
        postId: string,
        currentUserId: string,
        page: number,
        limit: number
    ): Promise<TPostLikesResponse> => {
        const post = await PostModel.findById(postId);
        if (!post) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
        }

        const skip = (page - 1) * limit;

        const [likes, total] = await Promise.all([
            PostLikeModel.find({ postId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            PostLikeModel.countDocuments({ postId }),
        ]);

        const userIds = likes.map((l) => l.userId.toString());

        const users = await UserModel.find({ _id: { $in: userIds } })
            .select("fullName username avatar")
            .lean();

        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        const formatted: TLikeUser[] = userIds.map((id) => {
            const user = userMap.get(id);
            return {
                id,
                fullName: user?.fullName ?? null,
                username: user?.username ?? null,
                avatar: user?.avatar ?? null,
            };
        });

        const isLikedByCurrentUser = currentUserId
            ? await PostLikeModel.exists({ postId, userId: currentUserId }).then(Boolean)
            : false;

        return { likes: formatted, total, isLikedByCurrentUser };
    }

    getLikedPosts = async (
        targetUserId: string,
        page: number,
        limit: number
    ): Promise<TLikedPostsResponse> => {
        const skip = (page - 1) * limit;

        const [likes, total] = await Promise.all([
            PostLikeModel.find({ userId: targetUserId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            PostLikeModel.countDocuments({ userId: targetUserId }),
        ]);

        const posts = likes.map((like) => ({
            id: like._id.toString(),
            postId: like.postId.toString(),
            userId: like.userId.toString(),
            createdAt: (like as any).createdAt?.toISOString?.() ?? "",
        }));

        return { posts, total, page, limit };
    }
}

export default PostLikeService;
