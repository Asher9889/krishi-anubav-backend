import { NextFunction, Request, Response } from "express";
import VoiceService from "./voice.service";
import { TJwtPayloadToken } from "../user/user.types";
import { ApiResponse } from "../../utils";
import { StatusCodes } from "http-status-codes";

class VoiceController {
    voiceService: VoiceService;

    constructor(voiceService: VoiceService) {
        this.voiceService = voiceService;
    }

    // generateToken = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const user = req.user as TJwtPayloadToken;

    //         const token = await this.voiceService.generateToken(user);

    //         return ApiResponse.success(res, StatusCodes.OK, "Token generated successfully", token);
    //     } catch (error) {
    //         next(error);
    //     }

    // }

    // Will generate Token and also assign agent to room
    startSession = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as TJwtPayloadToken;

            const session = await this.voiceService.startSession(user);

            return ApiResponse.success(res, StatusCodes.OK, "Session started successfully", session);
        } catch (error) {
            next(error);
        }
    }
}

export default VoiceController;