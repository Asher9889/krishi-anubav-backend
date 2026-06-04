import mongoose, { Schema } from "mongoose";

interface IKnowledgePost extends mongoose.Document {
  userId: mongoose.Types.ObjectId;

  name: string;
  location: string;
  state: string;
  district: string;

  knowledge: string;

  images: string[];

  likesCount: number;
  commentsCount: number;

  isActive: boolean;
}

const knowledgePostSchema = new Schema<IKnowledgePost>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      required: true,
    },

    state: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    knowledge: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images: string[]) => images.length <= 3,
        message: 'Maximum 3 images allowed',
      },
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const PostModel = mongoose.model<IKnowledgePost>('Post', knowledgePostSchema);

export default PostModel;