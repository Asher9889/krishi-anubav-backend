
import mongoose from "mongoose";
import { agmarkApi, apiEndPoints, logger } from "../../config";
import { helpers } from "../../shared";
import { ApiError } from "../../utils";
import CommodityModel from "./commodity.model";
import { IAgmarkResponse, IAgmarkResponseData, IAgmarkCommodityPriceResponse, ICropPriceData } from "./maket.types";
import { StatusCodes } from "http-status-codes";
import pLimit from "p-limit";


class AgmarkService {
    getAllAgmarkMasterData = async () => {
        try {
            const { url, method } = apiEndPoints.agmark.getAllData;
            const response = await agmarkApi.request<IAgmarkResponse<IAgmarkResponseData>>({
                url,
                method,
            });
            return response.data.data;
        } catch (error: any) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.response?.data?.message || "Failed to fetch commodities");
        }
    }

    getAllAgmarkCommodityPrices = async ({ groupId, commodityId }: { groupId: number, commodityId: number }) => {
        try {
            const { url, method } = apiEndPoints.agmark.getAllCommodityPrices;
            const data = {
                "from_date": helpers.todayISODate,
                "to_date": helpers.todayISODate,
                "data_type": "100004", // Price
                "group": groupId, // 1
                "commodity": commodityId, //  3
                "state": "[34]", // uttar pradesh
                "district": "[100001]", // "All Districts"
                "market": "[100002]", // "All Markets"
                "grade": "[100003]", // all grade
                "variety": "[100007]", // all variety
                //     "page": "1",
                "limit": "1000"
            }
            const response = await agmarkApi.request<IAgmarkResponse<IAgmarkCommodityPriceResponse>>({
                url,
                method,
                data
            });

            const priceData = response.data.data.records[0].data;

            const cropPriceData = priceData.map((item) => {
                // const commodityId = this.commodityMap.get((item.cmdt_name.toLowerCase()));
                return {
                    commodityId: null,
                    commodityName: item.cmdt_name,
                    commodityGroupName: item.cmdt_grp_name,

                    // Location
                    stateName: item.state_name,
                    districtName: item.district_name,
                    marketName: item.market_name,

                    // Commodity details from AGMARK
                    varietyName: item.variety_name,
                    gradeName: item.grade_name,

                    // Prices
                    minPrice: item.min_price,
                    maxPrice: item.max_price,
                    modalPrice: item.model_price,

                    priceUnit: item.unit_name_price,

                    // AGMARK arrival date
                    arrivalDate: helpers.toISODate(item.arrival_date),
                } as ICropPriceData;
            });

            return cropPriceData;

        } catch (error: any) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.response?.data?.message || error.message || "Failed to fetch commodity prices");
        }
    }

    // fetchAllCommoditiesForCache = async () => {
    //     try {
    //         logger.info("Fetching all commodities for cache...");
    //         const commodities = await CommodityModel.find({}, { _id: 1, agmarkCommodityName: 1, translation: 1, agmarkCommodityId: 1, agmarkGroupId: 1, }).lean();
    //         return commodities.map(({ _id, ...rest }, _) => {

    //             this.commodityMap.set((rest.agmarkCommodityName).toLowerCase(), { id: _id, groupId: rest.agmarkGroupId, commodityId: rest.agmarkCommodityId }); // Populate the commodityMap for future reference

    //             return this.commodityMap;
    //         });
    //     } catch (error: any) {
    //         logger.error(`Failed to fetch all commodities. Error: ${error.message}`);
    //         throw error;
    //     }
    // }

}

export default AgmarkService;