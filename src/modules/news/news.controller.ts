import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../utils";
import NewsService from "./news.service";

class NewsController {
    newsService: NewsService;

    constructor(newsService: NewsService) {
        this.newsService = newsService;
    }

    getNews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const news = await this.newsService.getNews();
            return ApiResponse.success(res, 200, "News fetched successfully", news);
        } catch (error) {
            console.error("Error fetching news:", error);
            return next(error);
        }
    }
}

export default NewsController;