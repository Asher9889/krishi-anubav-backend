import mongoose from "mongoose";

interface Commodity extends mongoose.Document {

    agmarkCommodityId: number,
    agmarkGroupId: number,

    agmarkCommodityName: string,
    translations: {
        en: string,
        hi: string,
    },

    imageUrl: string,

    category: string,

    searchable: boolean,

    syncEnabled: boolean,
    isFeatured: boolean,

}

const commoditySchema = new mongoose.Schema<Commodity>({
    agmarkCommodityId: { type: Number, required: true, unique: true },
    agmarkGroupId: { type: Number, required: true },

    agmarkCommodityName: { type: String, required: true },
    translations: {
        en: { type: String, required: true, trim: true },
        hi: { type: String, required: true, trim: true }
    },

    imageUrl: { type: String, required: true },

    category: { type: String, required: true },

    searchable: { type: Boolean, default: true },

    syncEnabled: { type: Boolean, default: true },

    isFeatured: { type: Boolean, default: false },
  
});

const CommodityModel = mongoose.model<Commodity>("Commodity", commoditySchema);

export default CommodityModel;