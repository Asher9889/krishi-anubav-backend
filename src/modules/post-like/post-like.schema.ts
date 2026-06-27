import z from "zod";
import mongoose from "mongoose";

const objectIdScheme = z.string().refine((val) => mongoose.isValidObjectId(val), {
    message: "Invalid ID format",
});

const postIdParamsSchema = z.object({
    postId: objectIdScheme,
});

const userIdParamsSchema = z.object({
    userId: objectIdScheme,
});

const getLikesQuerySchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
});

const getLikedPostsQuerySchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
});

export { postIdParamsSchema, userIdParamsSchema, getLikesQuerySchema, getLikedPostsQuerySchema };
