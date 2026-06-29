import { StatusCodes } from "http-status-codes";
import { UserModel } from "../user";
import { TCreatePostDTO, TGetPostsPayload } from "./posts.types";
import { ApiError } from "../../utils";
import { aiApi, apiEndPoints } from "../../config";
import PostModel from "./post.model";
import mongoose from "mongoose";
import minioService from "../../shared/storage/s3.service";


class PostsService {

    createPost = async (post: TCreatePostDTO): Promise<{ success: boolean }> => {

        const { userId, postData, images } = post;
        try {
            const user = UserModel.findById(userId).lean();
            if (!user) {
                throw new ApiError(StatusCodes.NOT_FOUND, "User not found. Cannot create post.");
            }
            const { url, method } = apiEndPoints.AI.createPost

            const aiPayload = {
                userinfo: postData,
                knowledge: postData.knowledge,
            }

            console.log("Sending request to AI API with payload:", aiPayload); // Log the payload being sent to the AI API for debugging
            const response = await aiApi.request({
                url: url,
                method: method,
                data: aiPayload
            });

            console.log("AI API response:", response.data); // Log the AI API response for debugging

            if (response.status !== StatusCodes.OK) {
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create post using AI API");
            }

            const imageUrls = await Promise.all(
                images.map(async (file) => {
                    const key = `posts/${userId}/${crypto.randomUUID()}_${file.originalname}`;

                    await minioService.sendFileToMinio(file, key);

                    return {
                        url: minioService.generatePublicAccessUrl(key),
                    };
                })
            );

            const imageUrlsList = imageUrls.map((obj) => obj.url);

            console.log("Uploaded image urls:", imageUrlsList); // Log the uploaded image urls for debugging

            const userIdObjectId = new mongoose.Types.ObjectId(userId);
            console.log("Creating post with userId:", userIdObjectId, "and postData:", postData); // Log the post creation details for debugging
            const post = new PostModel({
                userId: userIdObjectId,
                name: postData.name,
                location: postData.location,
                state: postData.state,
                district: postData.district,
                knowledge: postData.knowledge,
                images: imageUrlsList,
                likesCount: 0,
                commentsCount: 0,
                isActive: true,
            });

            const [result, postCount] = await Promise.allSettled([
                post.save(),
                UserModel.findByIdAndUpdate(userIdObjectId, { $inc: { postsCount: 1 } }).lean()
            ]);

            if (!result.status || result.status !== "fulfilled") {
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create Post.");
            }

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    getPosts = async ({ userId, query }: { userId: string, query: TGetPostsPayload }) => {
        try {
            const {limit = 20, page=1} = query;

            const skip = (page - 1) * limit;
            const id = new mongoose.Types.ObjectId(userId);
            console.log("Fetching posts for userId:", userId, "with pagination:", { page, limit });

            const posts = await PostModel.find({ userId: id, isActive: true }).sort({ createdAt: -1 }).limit(limit).skip(skip).lean();
            const formattedPosts = posts.map(({ _id, userId, ...post }, index) => {
                return {
                    id: _id.toString(),
                    userId: userId.toString(),
                    ...post,
                };
            });

            const totalPosts = await PostModel.countDocuments({ userId: id, isActive: true });
            return { posts: formattedPosts, totalPosts };
        } catch (error) {
            throw error;
        }
    }
}
export default PostsService;