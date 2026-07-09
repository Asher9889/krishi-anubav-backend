import express from "express";
import { authRoutes } from "../../modules/auth";
import { userRoutes } from "../../modules/user";
import { stateRoutes } from "../../modules/state";
import { uploadRoutes } from "../../modules/uploads";
import { newsRoutes } from "../../modules/news";
import { postRoutes } from "../../modules/posts";
import { feedRoutes } from "../../modules/feed";
import { followRoutes } from "../../modules/follow";
import { postLikeRoutes } from "../../modules/post-like";
import { translationRoutes } from "../../modules/translations";
import { marketRoutes } from "../../modules/market";
import { voiceRoutes } from "../../modules/voice";

const router = express.Router();


router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/users", followRoutes);
router.use("/states", stateRoutes); 
router.use("/uploads", uploadRoutes);
router.use("/news", newsRoutes);
router.use("/feed", feedRoutes);
router.use("/posts", postRoutes);
router.use("/posts", postLikeRoutes);
router.use("/translations", translationRoutes);
router.use("/market", marketRoutes);

router.use("/voice", voiceRoutes);

export default router;