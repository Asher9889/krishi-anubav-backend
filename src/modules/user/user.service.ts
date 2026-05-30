import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils";
import { UserModel } from "./user.model";

class UserService {
    checkUsernameAvailability = async (username: string): Promise<{ available: boolean }> => {
        try {
            const existingUser = await UserModel.findOne({ username: username.trim().toLowerCase() }).lean();

            return { available: !existingUser };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to check username availability");
        }
    }
}

export default UserService;