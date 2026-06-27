import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils";
import FollowModel from "./follow.model";
import { UserModel } from "../user";
import { TFollowersResponse } from "./follow.types";

class FollowService {

    follow = async (followerId: string, followingId: string): Promise<{ followed: boolean }> => {
        if (followerId === followingId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot follow yourself");
        }

        const [follower, following] = await Promise.all([
            UserModel.findById(followerId),
            UserModel.findById(followingId),
        ]);

        if (!follower) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Follower user not found");
        }
        if (!following) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User to follow not found");
        }

        const existingFollow = await FollowModel.findOne({
            followerId,
            followingId,
        });

        if (existingFollow) {
            throw new ApiError(StatusCodes.CONFLICT, "Already following this user");
        }

        await FollowModel.create({ followerId, followingId });

        await Promise.all([
            UserModel.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } }),
            UserModel.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } }),
        ]);

        return { followed: true };
    }

    unfollow = async (followerId: string, followingId: string): Promise<{ unfollowed: boolean }> => {
        if (followerId === followingId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot unfollow yourself");
        }

        const follow = await FollowModel.findOneAndDelete({
            followerId,
            followingId,
        });

        if (!follow) {
            throw new ApiError(StatusCodes.NOT_FOUND, "You are not following this user");
        }

        await Promise.all([
            UserModel.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } }),
            UserModel.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } }),
        ]);

        return { unfollowed: true };
    }

    getFollowers = async (
        userId: string,
        currentUserId: string,
        page: number,
        limit: number
    ): Promise<{ followers: TFollowersResponse[]; total: number; page: number; limit: number }> => {
        const skip = (page - 1) * limit;

        const [follows, total] = await Promise.all([
            FollowModel.find({ followingId: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            FollowModel.countDocuments({ followingId: userId }),
        ]);

        const followerIds = follows.map((f) => f.followerId.toString());

        const users = await UserModel.find({ _id: { $in: followerIds } })
            .select("fullName username avatar bio")
            .lean();

        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        const myFollowing = currentUserId
            ? await FollowModel.find({
                  followerId: currentUserId,
                  followingId: { $in: followerIds },
              })
                  .select("followingId")
                  .lean()
            : [];

        const followingSet = new Set(myFollowing.map((f) => f.followingId.toString()));

        const followers: TFollowersResponse[] = followerIds.map((id) => {
            const user = userMap.get(id);
            return {
                id,
                fullName: user?.fullName ?? null,
                username: user?.username ?? null,
                avatar: user?.avatar ?? null,
                bio: user?.bio ?? null,
                isFollowing: followingSet.has(id),
            };
        });

        return { followers, total, page, limit };
    }

    getFollowing = async (
        userId: string,
        currentUserId: string,
        page: number,
        limit: number
    ): Promise<{ following: TFollowersResponse[]; total: number; page: number; limit: number }> => {
        const skip = (page - 1) * limit;

        const [follows, total] = await Promise.all([
            FollowModel.find({ followerId: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            FollowModel.countDocuments({ followerId: userId }),
        ]);

        const followingIds = follows.map((f) => f.followingId.toString());

        const users = await UserModel.find({ _id: { $in: followingIds } })
            .select("fullName username avatar bio")
            .lean();

        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        const myFollowing = currentUserId
            ? await FollowModel.find({
                  followerId: currentUserId,
                  followingId: { $in: followingIds },
              })
                  .select("followingId")
                  .lean()
            : [];

        const followingSet = new Set(myFollowing.map((f) => f.followingId.toString()));

        const following: TFollowersResponse[] = followingIds.map((id) => {
            const user = userMap.get(id);
            return {
                id,
                fullName: user?.fullName ?? null,
                username: user?.username ?? null,
                avatar: user?.avatar ?? null,
                bio: user?.bio ?? null,
                isFollowing: followingSet.has(id),
            };
        });

        return { following, total, page, limit };
    }
}

export default FollowService;
