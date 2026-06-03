import NewsModel from "./news.model"

class NewsService {

    getNews = async () => {
        try {
            const news = await NewsModel.find({}).sort({ publish_date: -1 }).limit(20);
            return news;
        } catch (error) {
            throw new Error("Error fetching news");
        }
    }
}

export default NewsService;