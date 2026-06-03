import NewsController from "./news.controller";
import NewsService from "./news.service";


const newsService = new NewsService();
const newsController = new NewsController(newsService);


export { newsController, newsService };