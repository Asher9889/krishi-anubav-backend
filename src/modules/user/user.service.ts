import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils";
import { UserModel } from "./user.model";
import { TUpdateUserRequest, TUserProfileResponse } from "./user.types";

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

    updateUser = async (id: string, data: TUpdateUserRequest): Promise<TUserProfileResponse> => {
        try {
            const user = await UserModel.findById(id);

            if (!user?._id) {
                throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
            }

            user.fullName = data.fullName.trim();
            user.username = data.username.trim().toLowerCase();
            user.bio = data.bio.trim() ?? null;
            user.avatar = data.avatar ?? null;
            user.gender = data.gender;
            user.isProfileCompleted = data.isProfileCompleted;

            await user.save();

            return {
                id: user._id.toString(),
                fullName: user.fullName ?? "",
                username: user.username ?? "",
                bio: user.bio ?? "",
                avatar: user.avatar ?? null,
                gender: user.gender,
                isProfileCompleted: user.isProfileCompleted ?? false,
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update user");
        }
    }
}

export default UserService;