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

            user.fullName = data.fullName;
            user.username = data.username;
            user.bio = data.bio;
            user.avatar = data.avatar;
            user.gender = data.gender;
            user.isProfileCompleted = data.isProfileCompleted;
            user.address = {
                line1: data.address.line1,
                line2: data.address.line2,

                latitude: data.address.latitude, 
                longitude: data.address.longitude,

                state: data.address.state,
                city: data.address.city,
            }
            user.phone = user.phone; // to trigger phone number validation
            const updatedUser = await user.save();
            if(!updatedUser._id){
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update user");
            }

            return {
                id: updatedUser._id.toString(),
                fullName:  user.fullName,
                username: user.username ?? "",
                bio: user.bio ?? "",
                avatar: user.avatar,
                gender: user.gender,
                isProfileCompleted: user.isProfileCompleted,
                phone: user.phone,
                address: {
                    line1: user.address?.line1 ?? null,
                    line2: user.address?.line2 ?? null,

                    latitude: Number(user.address?.latitude) ?? null,
                    longitude: Number(user.address?.longitude) ?? null,

                    city: user.address?.city ?? null,
                    district: user.address?.district ?? null,
                    state: user.address?.state ?? null,
                }
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