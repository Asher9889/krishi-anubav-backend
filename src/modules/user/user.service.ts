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

    updateMe = async (id: string, field: Record<string, unknown>) => {
        try {
            console.log("Updating user with id:", id, "and field:", field);
            const user = await UserModel.findById(id);
            if (!user?._id) {
                throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
            }
            const updates = this.flattenObject(field);
            await UserModel.findByIdAndUpdate(id, { $set: updates }, { new: false }).lean();
            return field;

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
}

export default UserService;