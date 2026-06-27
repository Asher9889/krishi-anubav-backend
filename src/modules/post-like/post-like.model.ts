import mongoose from "mongoose";


interface IPostLike extends mongoose.Document {
    postId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const postLikeSchema = new mongoose.Schema<IPostLike>({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: false, versionKey: false });

postLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
postLikeSchema.index({ postId: 1 });
postLikeSchema.index({ userId: 1 });

const PostLikeModel =  mongoose.model<IPostLike>('PostLike', postLikeSchema);

export default PostLikeModel;