import express from "express";
import { authenticate, schemaValidate } from "../../middlewares";
import queryValidate from "../../middlewares/queryValidate";
import { feedController } from "./feed.module";
import { feedQuerySchema } from "./feed.schema";

const router = express.Router();

router.get("/", queryValidate(feedQuerySchema), feedController.getFeed);

export default router;
