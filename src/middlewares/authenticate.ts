import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils";
import { envConfig } from "../config";
import { TJwtPayloadToken } from "../modules/user/user.types";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Authorization header is required");
        }

        const [scheme, token] = authorizationHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid authorization header format");
        }

        const decoded = jwt.verify(token, envConfig.jwtAccessTokenSecret) as TJwtPayloadToken;

        if (!decoded?.phone || !decoded?.role) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token");
        }

        req.user = {
            phone: decoded.phone,
            role: decoded.role,
        };

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

        return next(new ApiError(StatusCodes.UNAUTHORIZED, error?.message || "Unauthorized"));
    }
};

export default authenticate;