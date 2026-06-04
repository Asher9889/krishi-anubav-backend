import express from "express";
import { authRoutes } from "../../modules/auth";
import { userRoutes } from "../../modules/user";
import { stateRoutes } from "../../modules/state";
import { uploadRoutes } from "../../modules/uploads";
import { newsRoutes } from "../../modules/news";
import { postRoutes } from "../../modules/posts";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/states", stateRoutes);
router.use("/uploads", uploadRoutes);
router.use("/news", newsRoutes);
router.use("/posts", postRoutes);

export default router;