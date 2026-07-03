import mongoose from "mongoose";
import { featuredCommoditiesSchema } from "./market.schema";
import z from "zod";

export interface IAgmarkResponse<T> {
    status: boolean;
    message: string;
    data: T;
}

export interface IAgmarkCommodityData {
    cmdt_id: number;
    cmdt_name: string;
    cmdt_group_id: number;
}

export interface IAgmarkCommodityGroupData {
    id: number;
    cmdt_grp_name: string
}

export interface IAgmarkResponseData {
    cmdt_data: IAgmarkCommodityData[];
    cmdt_group_data: IAgmarkCommodityGroupData[];
}

export interface IAgmarkCommodityPriceData {
    "cmdt_name": string;
    "max_price": string;
    "min_price": string;
    "grade_name": string;
    "state_name": string;
    "market_name": string;
    "model_price": string;
    "arrival_date": string;  //"01-07-2026",
    "variety_name": string,
    "cmdt_grp_name": string,
    "district_name": string,
    "unit_name_price": string
}

export interface IAgmarkCommodityPriceResponse {

    records: [
        {
            data: IAgmarkCommodityPriceData[];
            pagination: {
                "total_count": 38,
                "total_pages": 1,
                "current_page": 1,
                "items_per_page": 1000
            }
        }
    ];
}

export type TCommodityCacheData = { id: mongoose.Types.ObjectId, groupId: number, commodityId: number };

export interface ICropPriceData {
    commodityId: mongoose.Types.ObjectId | null;
    commodityName: string;
    commodityGroupName: string;
    stateName: string;
    districtName: string;
    marketName: string;
    varietyName: string;
    gradeName: string;
    minPrice: string;
    maxPrice: string;
    modalPrice: string;
    priceUnit: string;
    arrivalDate: string;
}

export type THomeScreenFeaturedCommoditiesBody = z.infer<typeof featuredCommoditiesSchema>; 