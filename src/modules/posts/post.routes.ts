import * as express from "express";
import { authenticate, schemaValidate } from "../../middlewares";
import { multerUpload } from "../uploads";
import { postsController } from "./posts.modules";
import { getPostsSchema } from "./posts.schema";

const router = express.Router();

router.post("/", authenticate, multerUpload.array("images", 1), postsController.createPost);
router.get("/",  authenticate, schemaValidate(getPostsSchema),   postsController.getPosts);  

export default router;