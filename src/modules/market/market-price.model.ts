import mongoose from "mongoose";

interface IMarketPrice extends mongoose.Document {
  // Reference to your Commodity document
  commodityId: mongoose.Types.ObjectId;
  commodityName: string;
  commodityGroupName: string;

  // Location
  stateName: string;
  districtName: string;
  marketName: string;

  // Commodity details from AGMARK
  varietyName: string;
  gradeName: string;

  // Prices
  minPrice: string;
  maxPrice: string;
  modalPrice: string;

  priceUnit: string;

  // AGMARK arrival date
  arrivalDate: string,

  createdAt: Date;
  updatedAt: Date;
}

const marketPriceSchema = new mongoose.Schema<IMarketPrice>({
  commodityId: { type: mongoose.Schema.Types.ObjectId, ref: "Commodity", required: true },
  commodityName: { type: String, required: true },
  commodityGroupName: { type: String, required: true },

  stateName: { type: String, required: true },
  districtName: { type: String, required: true },
  marketName: { type: String, required: true },

  varietyName: { type: String, required: true },
  gradeName: { type: String, required: true },

  minPrice: { type: String, required: true },
  maxPrice: { type: String, required: true },
  modalPrice: { type: String, required: true },

  priceUnit: { type: String, required: true },

  arrivalDate: { type: String, required: true },
}, { timestamps: true, versionKey: false });

const MarketPriceModel = mongoose.model<IMarketPrice>("MarketPrice", marketPriceSchema, "market_prices");

export default MarketPriceModel;