import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils";
import { TJwtPayloadToken, UserModel } from "../user"
import { LivekitService } from "../livekit";
import { randomUUID } from "crypto";
import { envConfig } from "../../config";

class VoiceService {
    livekitService: LivekitService;

    constructor(livekitService: LivekitService) {
        this.livekitService = livekitService;
    }
    
    // generateToken = async(user: TJwtPayloadToken) => {
    //     try {
    //         const User = await UserModel.findById(user.id, { _id: 1, fullName: 1 }).lean();
    //         if (!User) {
    //             throw new ApiError(StatusCodes.NOT_FOUND, "We are unable to find the user. Please check your credentials and try again.");
    //         }
    //         const roomName = randomUUID();
    //         const token = await this.livekitService.generateToken({
    //             userId: user.id,
    //             name: User.fullName ?? "Profile Uncompleted",
    //             roomName: roomName
    //         });
    //         return { token, roomName, livekitUrl: envConfig.livekitUrl};
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    startSession = async(user: TJwtPayloadToken) => {
        try {
            const User = await UserModel.findById(user.id, { _id: 1, fullName: 1 }).lean();
            if (!User) {
                throw new ApiError(StatusCodes.NOT_FOUND, "We are unable to find the user. Please check your credentials and try again.");
            }
            const roomName = randomUUID();
            const token = await this.livekitService.createAgriAiChatRoom({
                userId: user.id,
                name: User.fullName ?? "Profile Uncompleted",
                roomName: roomName
            });
            return { token, roomName, livekitUrl: envConfig.livekitUrl};
        } catch (error) {
            throw error;
        }
    }
}

export default VoiceService;