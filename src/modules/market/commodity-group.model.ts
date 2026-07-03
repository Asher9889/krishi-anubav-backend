import mongoose, { Document, Schema } from "mongoose";

interface ICommodityGroup extends Document {
    agmarkGroupId: number;
    agmarkGroupName: string;
    translations: {
        en: string;
        hi: string;
    };
}

const commodityGroupSchema= new Schema<ICommodityGroup>({
    agmarkGroupId: { type: Number, required: true },
    agmarkGroupName: { type: String, required: true, trim: true },
    translations: {
        en: { type: String, required: true, trim: true },
        hi: { type: String, required: true, trim: true },
    }
}, {timestamps: true, versionKey: false});

commodityGroupSchema.index({ agmarkGroupId: 1 }, { unique: true });

const CommodityGroupModel = mongoose.model<ICommodityGroup>("CommodityGroup", commodityGroupSchema, "commodity_groups");

export default CommodityGroupModel;