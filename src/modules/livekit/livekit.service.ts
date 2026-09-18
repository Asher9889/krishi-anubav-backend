import { AccessToken, RoomServiceClient, AgentDispatchClient } from 'livekit-server-sdk';
import { GenerateTokenInput } from "./livekit.types";
import { envConfig, logger } from '../../config';
import { TJwtPayloadToken } from '../user';

class LivekitService {
    private roomServiceClient: RoomServiceClient;
    private agentDispatchClient: AgentDispatchClient;

    constructor() {
        this.roomServiceClient = new RoomServiceClient(envConfig.livekitUrl, envConfig.livekitApiKey, envConfig.livekitApiSecret);
        this.agentDispatchClient = new AgentDispatchClient(envConfig.livekitUrl, envConfig.livekitApiKey, envConfig.livekitApiSecret);
    }

    private generateToken = async (user: GenerateTokenInput) => {
        const accessToken = new AccessToken(envConfig.livekitApiKey, envConfig.livekitApiSecret, {
            identity: user.userId,
            name: user.name,
        });

        accessToken.addGrant({ roomJoin: true, room: user.roomName });

        const token = await accessToken.toJwt();

        return token;
    }

    createAgriAiChatRoom = async (user: GenerateTokenInput) => {
        await this.roomServiceClient.createRoom({
            name: user.roomName,
            emptyTimeout: 60,
            maxParticipants: 2,
        });
        logger.info(`Room created successfully: ${user.roomName}`);
        const dispatch = await this.agentDispatchClient.createDispatch(user.roomName, envConfig.agriAgentName);
        logger.info(`Agent ${envConfig.agriAgentName} Dispatch created successfully for room: ${user.roomName}, ${dispatch}`);
        const token = await this.generateToken({
            userId: user.userId,
            name: user.name,
            roomName: user.roomName
        });


        return token;
    }
}


export default LivekitService;