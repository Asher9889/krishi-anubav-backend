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

    getNewsById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string
            const news = await this.newsService.getNewsById(id);
            return ApiResponse.success(res, 200, "News fetched successfully", news);
        } catch (error) {
            console.error("Error fetching news by ID:", error);
            return next(error);
        }  
    }     
}

export default NewsController;