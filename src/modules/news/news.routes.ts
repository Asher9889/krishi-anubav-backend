import express from "express";
import { newsController } from "./news.modules";
import { authenticate } from "../../middlewares";
import paramsValidate from "../../middlewares/paramsValidate";
import { newsIdSchema } from "./news.schema";

const router = express.Router();

// Define news-related routes here

router.get("/", authenticate, newsController.getNews);
router.get("/:id", paramsValidate(newsIdSchema), newsController.getNewsById);



export default router;