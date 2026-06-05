import * as express from "express";
import { authenticate, schemaValidate } from "../../middlewares";
import { multerUpload } from "../uploads";
import { postsController } from "./posts.modules";
import { getPostsSchema } from "./posts.schema";
import queryValidate from "../../middlewares/queryValidate";

const router = express.Router();

router.post("/", authenticate, multerUpload.array("images", 5), postsController.createPost);
router.get("/",  authenticate, queryValidate(getPostsSchema),   postsController.getPosts);  

export default router;