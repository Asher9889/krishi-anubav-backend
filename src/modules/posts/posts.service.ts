import { StatusCodes } from "http-status-codes";
import { UserModel } from "../user";
import { TCreatePostDTO } from "./posts.types";
import { ApiError } from "../../utils";
import { aiApi, apiEndPoints } from "../../config";
import PostModel from "./post.model";
import mongoose from "mongoose";
import { } from "mongoose";


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
                userInfo: postData,
                knowledge: postData.knowledge,
            }
            const response = await aiApi.request({
                method: method,
                url: url,
                data: aiPayload
            });

            console.log("AI API response:", response.data); // Log the AI API response for debugging

            if (response.status !== StatusCodes.OK) {
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create post using AI API");
            }

            const userIdObjectId = new mongoose.Types.ObjectId(userId);
            const post = new PostModel({
                userId: userIdObjectId,
                name: postData.name,
                location: postData.location,
                state: postData.state,
                district: postData.district,
                knowledge: postData.knowledge,
                images: images.map(file => file.path),
                likesCount: 0,
                commentsCount: 0,
                isActive: true,
            });

            const result = await post.save();
            if (!result._id) {
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create Post.");
            }

            return { success: true };
        } catch (error) {
            throw error;
        }
    }
}
export default PostsService;