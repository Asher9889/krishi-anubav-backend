import * as express from "express";
import { authenticate } from "../../middlewares";
import { multerUpload } from "../uploads";
import { postsController } from "./posts.modules";

const router = express.Router();

router.post("/", authenticate, multerUpload.array("images", 1), postsController.createPost);

export default router;