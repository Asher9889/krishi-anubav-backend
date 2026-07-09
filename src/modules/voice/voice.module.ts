import VoiceController from "./voice.controller";
import VoiceService from "./voice.service";
import { livekitService } from "../livekit";

const voiceService = new VoiceService(livekitService);
const voiceController = new VoiceController(voiceService);

export { voiceController, voiceService };