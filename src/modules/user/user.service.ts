import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils";
import { IUser, UserModel } from "./user.model";
import { TUpdateUserRequest, TUserProfileResponse, TUserPublicProfileResponse } from "./user.types";
import FollowModel from "../follow/follow.model";
import { logger } from "../../config";

class UserService {
    checkUsernameAvailability = async (username: string): Promise<{ available: boolean }> => {
        try {
            const existingUser = await UserModel.findOne({ username: username.trim().toLowerCase() }).lean();

            if (existingUser) {
                return { available: false };
            }
            return { available: true };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to check username availability");
        }
    }

    getUserProfile = async (loggedInUserId: string, userId: string): Promise<TUserPublicProfileResponse> => {
        try {
            const user = await UserModel.findById(userId).lean();
            if (!user) {
                throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
            }

            const isFollowing = await FollowModel.exists({
                followerId: loggedInUserId,
                followingId: userId,
            }).lean();

            logger.info(`Fetched user profile for user ID: ${userId}. Is following: ${!!isFollowing}`);

            return {
                id: user._id.toString(),
                fullName: user.fullName || "",
                name: user.fullName || null,
                username: user.username || "",
                bio: user.bio || "",
                occupation: user.occupation || null,
                avatar: user.avatar || null,
                state: user.address?.state || null,
                city: user.address?.city || null,
                district: user.address?.district || null,
                village: null,
                postsCount: user.postsCount || 0,
                followersCount: user.followersCount || 0,
                followingCount: user.followingCount || 0,
                isFollowing: !!isFollowing, // This should be determined based on the authenticated user's following list
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch user profile");
        }
    }

    updateMe = async (id: string, field: Record<string, unknown>) => {
        try {
            console.log("Updating user with id:", id, "and field:", field);
            const user = await UserModel.findById(id);
            if (!user?._id) {
                throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
            }
            const updates = this.flattenObject(field);
            updates.isProfileCompleted = this.checkProfileCompletion({ ...user.toObject(), ...updates });
            await UserModel.findByIdAndUpdate(id, { $set: updates }, { new: false }).lean();
            return { ...field, isProfileCompleted: updates.isProfileCompleted };

        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update user");
        }
    }

    flattenObject = (obj: Record<string, unknown>, prefix = ""): Record<string, unknown> => {
        return Object.entries(obj).reduce(
            (acc, [key, value]) => {
                const path = prefix ? `${prefix}.${key}` : key;

                if (
                    value &&
                    typeof value === "object" &&
                    !Array.isArray(value)
                ) {
                    Object.assign(
                        acc,
                        this.flattenObject(
                            value as Record<string, unknown>,
                            path
                        )
                    );
                } else {
                    acc[path] = value;
                }

                return acc;
            },
            {} as Record<string, unknown>
        );
    };

    // user.utils.ts

    checkProfileCompletion = (user: Partial<IUser>) => {
        return Boolean(
            user.username &&
            user.fullName &&
            user.gender &&
            // user.avatar &&
            // user.preferredLanguage &&
            user.occupation
            // user.address?.city &&
            // user.address?.district &&
            // user.address?.state
        );
    };
}

export default UserService;