import express from "express";
import { authenticate } from "../../middlewares";
import { followController } from "./follow.module";
import paramsValidate from "../../middlewares/paramsValidate";
import { followParamsSchema } from "./follow.validation";

const router = express.Router();

router.post("/:userId/follow", authenticate, paramsValidate(followParamsSchema), followController.follow);

router.delete("/:userId/follow", authenticate, paramsValidate(followParamsSchema), followController.unfollow);

router.get("/:userId/followers", paramsValidate(followParamsSchema), followController.getFollowers);

router.get("/:userId/following", paramsValidate(followParamsSchema), followController.getFollowing);

export default router;
