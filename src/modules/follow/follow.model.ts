import mongoose, { Document } from 'mongoose';

interface IFollow extends Document {
    followerId: mongoose.Types.ObjectId;
    followingId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const followSchema = new mongoose.Schema<IFollow>({
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: false, versionKey: false }); 

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followerId: 1 });
followSchema.index({ followingId: 1 });

const FollowModel = mongoose.model<IFollow>('Follow', followSchema);

export default FollowModel;
