import express from "express";
import { newsController } from "./news.modules";
import { authenticate } from "../../middlewares";

const router = express.Router();

// Define news-related routes here

router.get("/", authenticate, newsController.getNews);


export default router;