import z from "zod";
import { feedQuerySchema, feedPostSchema } from "./feed.schema";

type TFeedPost = z.infer<typeof feedPostSchema>;
type TFeedQuery = z.infer<typeof feedQuerySchema>;

export type { TFeedPost, TFeedQuery };
