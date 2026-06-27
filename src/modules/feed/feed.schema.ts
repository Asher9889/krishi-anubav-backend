import mongoose from "mongoose";
import z from "zod";

const objectIdScheme = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
});

const feedPostSchema = z.object({
  id: objectIdScheme,
  userId: objectIdScheme,
  name: z.string(),
  location: z.string(),
  state: z.string(),
  district: z.string(),
  knowledge: z.string(),
  images: z.array(z.string()),
  likesCount: z.number(),
  commentsCount: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const feedQuerySchema = z.object({
  cursor: z.coerce.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid cursor format",
  }).nullable().default(null),
  limit: z.coerce.number().default(10),
});

export { feedPostSchema, feedQuerySchema };
