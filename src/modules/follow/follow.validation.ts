import z from "zod";
import mongoose from "mongoose";

const objectIdScheme = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
});

const followParamsSchema = z.object({
    userId: objectIdScheme,
});

const getFollowersQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
});

export { followParamsSchema, getFollowersQuerySchema };
