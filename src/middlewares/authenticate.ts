import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils";
import { envConfig, logger } from "../config";
import { TJwtPayloadToken } from "../modules/user/user.types";
import { UserModel } from "../modules/user";
import mongoose from "mongoose";

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logger.info("Authenticating user...");
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Authorization header is required");
        }

        const [scheme, token] = authorizationHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid authorization header format");
        }

        const decoded = jwt.verify(token, envConfig.jwtAccessTokenSecret) as TJwtPayloadToken;
        console.log("Decoded JWT payload:", decoded); // Log the decoded payload for debugging

        if (!decoded?.phone || !decoded?.role) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token");
        }

        const userId = decoded.id;
        if (!userId) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "User ID is missing in the token");
        }
        if(mongoose.Types.ObjectId.isValid(userId) === false) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid user ID in the token");
        }

        const isUserValid = await UserModel.findById(userId, { _id: 1 }).lean();
        if (!isUserValid) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "User does not exist");
        }

        req.user = {
            id: decoded.id,
            phone: decoded.phone,
            role: decoded.role,
        };
        logger.info("User authenticated successfully");
        next();
    } catch (error: any) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new ApiError(StatusCodes.UNAUTHORIZED, "Access token has expired"));
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token"));
        }

        if (error instanceof ApiError) {
            return next(error);
        }

        logger.error("Error occurred while authenticating user:", error);
        return next(new ApiError(StatusCodes.UNAUTHORIZED, error?.message || "Unauthorized"));
    }
};

export default authenticate;