import { StatusCodes } from "http-status-codes";
import { ApiError, ApiResponse } from "../../utils";
import { THomeScreenFeaturedCommoditiesBody } from "./maket.types";
import MarketService from "./market.service";
import CommodityService from "./market.service";
import { logger } from "../../config";

class MarketController {
    marketService: MarketService;

    constructor(marketService: MarketService) {
        this.marketService = marketService;
    }

    getHomeScreenFeaturedCommodities = async (req: any, res: any) => {
        try {
            const body = req.validatedQuery as THomeScreenFeaturedCommoditiesBody;
            logger.info(`Fetching featured commodities for home screen with body: ${JSON.stringify(body)}`);
            const featuredCommodities = await this.marketService.getHomeScreenFeaturedCommodities(body);
            return ApiResponse.success(res, StatusCodes.OK, "Featured commodities fetched successfully", featuredCommodities);
        } catch (error) {
            throw error;
        }
    };

    getCommodities = async (req: any, res: any) => {
        try {
            logger.info(`Fetching all commodities`);
            const language = req.headers["accept-language"] ?? "en";
            const commodities = await this.marketService.getAllCommodities({ language });
            return ApiResponse.success(res, StatusCodes.OK, "Commodities fetched successfully", commodities);
        } catch (error) {
            throw error;
        }
    }

    // Controller methods will be defined here


}

export default MarketController;