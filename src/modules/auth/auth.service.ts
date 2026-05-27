import { StatusCodes } from "http-status-codes";
import { ApiError, generateJWTToken } from "../../utils";
import { UserModel } from "./auth.model";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

class AuthService {
    registerUser = async (name: string, email: string, password: string) => {
        try {
            const existingUser = await UserModel.findOne({ email }).lean();
            if (existingUser) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "User already exists");
            }

            const user = await UserModel.create({ name, email, password });
            if (!user) {
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create user");
            }
            return { id: user._id, email: user.email, name: user.name };
        } catch (error) {
            throw error;
        }
    }

    loginUser = async (email: string, password: string) => {
        try {

            const user = await UserModel.findOne({ email }).select("+password");
            if (!user) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found. Please register first.");
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
            }
            const userId = user._id.toString();
            const token = generateJWTToken(userId);

            return {
                token,
                user: {
                    id: userId,
                    email: user.email,
                    name: user.name,
                },
            };
        } catch (error) {
            throw error;
        }
    }
}

export default AuthService;