import mongoose from "mongoose";
import { TMarketCommodityGroup } from "./market.constants";

interface Commodity extends mongoose.Document {

    agmarkCommodityId: number,
    agmarkGroupId: number,

    name: string,
    hindiName: string,

    imageUrl: string,

    category: string,

    searchable: true,

    syncEnabled: true,

}

const commoditySchema = new mongoose.Schema<Commodity>({
    agmarkCommodityId: { type: Number, required: true, unique: true },
    agmarkGroupId: { type: Number, required: true },

    name: { type: String, required: true },
    hindiName: { type: String, required: true },

    imageUrl: { type: String, required: true },

    category: { type: String, required: true },

    searchable: { type: Boolean, default: true },

    syncEnabled: { type: Boolean, default: true },
  
});

const CommodityModel = mongoose.model<Commodity>("Commodity", commoditySchema);

export default CommodityModel;