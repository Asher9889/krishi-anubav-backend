import express from "express";
import { authenticate, paramsValidate, queryValidate } from "../../middlewares";

import { postLikeController } from "./post-like.module";
import { postIdParamsSchema, userIdParamsSchema, getLikesQuerySchema, getLikedPostsQuerySchema } from "./post-like.schema";

const router = express.Router();

router.post("/:postId/likes", authenticate, paramsValidate(postIdParamsSchema), postLikeController.likePost);
router.delete("/:postId/likes", authenticate, paramsValidate(postIdParamsSchema), postLikeController.unlikePost);
router.get("/:postId/likes", authenticate, paramsValidate(postIdParamsSchema), queryValidate(getLikesQuerySchema), postLikeController.getPostLikes);
router.get("/user/:userId/likes", authenticate, paramsValidate(userIdParamsSchema), queryValidate(getLikedPostsQuerySchema), postLikeController.getLikedPosts);

export default router;
