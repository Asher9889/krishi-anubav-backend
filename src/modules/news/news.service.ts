import { id } from "zod/locales";
import NewsModel from "./news.model"
import { ApiError } from "../../utils";

class NewsService {

    getNews = async () => {
        try {
            /**
             *  id: '4',
        tag: 'रोजगार सूचना',
        title: 'मनरेगा में वृद्धि',
        subtitle: '150 दिन का रोजगार सुनिश्चित, 2 करोड़ नए जॉब कार्ड।',
        image: "require('./assets/employment.png')",
        accentColor: '#8B4513',
        backgroundColor: '#FDF6F3',
             */
            const news = await NewsModel.find({}).sort({ publish_date: -1 }).limit(20).lean();
            const transformedNews = news.map(({_id, fullDescription, createdAt, updatedAt,  ...item}) => {
                return {
                    id: item.id,
                    tag: item.tag,
                    title: item.title,
                    subtitle: item.shortSummary,
                    image: "",
                } 
            });
            return transformedNews;
        } catch (error:any) {
            throw new ApiError(500, error.message||  "Failed to fetch news");
        }
    }

    getNewsById = async (id: string) => {
        try {
            const news = await NewsModel.findOne({ id }).lean();

            if (!news) {
                throw new ApiError(404, "News not found");
            }
            return news;
        } catch (error:any) {
            throw new ApiError(500, error.message || "Failed to fetch news");
        }
    }
}

export default NewsService;