import mongoose, { Schema } from "mongoose";

const agriculturalNewsSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    shortSummary: {
      type: String,
      required: true,
      trim: true,
    },

    fullDescription: {
      type: String,
    },

    htmlDescription: {
      type: String,
      required: true,
    },

    pdfUrl: {
      type: String,
      trim: true,
    },

    source: {
      type: String,
      trim: true,
    },

    publishDate: {
      type: Date,
      required: true,
      index: true
    },
  },
  {
    timestamps: true,
  }
);

// agriculturalNewsSchema.index(
//   {
//     title: "text",
//     shortSummary: "text",
//   },
//   {
//     weights: {
//       title: 10,
//       shortSummary: 5,
//     },
//   }
// );

// agriculturalNewsSchema.index(
//   {
//     source: 1,
//     title: 1,
//   },
//   {
//     unique: true,
//   }
// );


const NewsModel = mongoose.model("AgriculturalNews", agriculturalNewsSchema, "krishi_news");

export default NewsModel;
