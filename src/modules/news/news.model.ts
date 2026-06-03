import mongoose, { Schema } from "mongoose";

interface INews extends mongoose.Document {
    id: string;
  tag?: string;
  category: string;
  title: string;
  shortSummary: string;
  fullDescription?: string;
  htmlDescription: string;
  pdfUrl?: string;
  source?: string;
  publishDate: Date;
  updatedAt?: string;
  createdAt?: string;
}

const agriculturalNewsSchema = new Schema<INews>(
  {
    id: {
        type: String,
    },
    tag: {
        type: String
    },
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
    updatedAt: {
      type: String
    },
    createdAt: {
      type: String
    }
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


const NewsModel = mongoose.model<INews>("News", agriculturalNewsSchema, "news");

export default NewsModel;
