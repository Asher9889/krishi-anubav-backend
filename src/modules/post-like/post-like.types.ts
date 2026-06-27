import z from "zod";
import { postIdParamsSchema } from "./post-like.schema";

type TLikeResponse = {
    liked: boolean;
}

type TLikeUser = {
    id: string;
    fullName: string | null;
    username: string | null;
    avatar: string | null;
}

type TPostLikesResponse = {
    likes: TLikeUser[];
    total: number;
    isLikedByCurrentUser: boolean;
}

type TLikedPost = {
    id: string;
    postId: string;
    userId: string;
    createdAt: string;
}

type TLikedPostsResponse = {
    posts: TLikedPost[];
    total: number;
    page: number;
    limit: number;
}

export type TLikePostParams = z.infer<typeof postIdParamsSchema>;

export type { TLikeResponse, TLikeUser, TPostLikesResponse, TLikedPost, TLikedPostsResponse };
