import { type JobContext, type JobProcess, ServerOptions, cli, defineAgent, llm, voice, inference } from '@livekit/agents';
import * as silero from '@livekit/agents-plugin-silero';
import { z } from 'zod';
import { STT as CustomSTT } from './adapters/stt';
import { TTS as CustomTTS } from './adapters/tts';
import { envConfig, logger } from '../../config';

const lookupWeather = llm.tool({
    description: 'Used to look up weather information.',
    parameters: z.object({
        location: z.string().describe('The location to look up weather information for'),
    }),
    execute: async ({ location }, { ctx }) => {
        return { weather: 'sunny', temperature: 70 };
    },
});

export default defineAgent({
    prewarm: async (proc: JobProcess) => {
        proc.userData.vad = await silero.VAD.load();
    },
    entry: async (ctx: JobContext) => {
        const agent = new voice.Agent({
            instructions: 'You are a friendly voice assistant built by LiveKit.',
            tools: { lookupWeather },
        });

        const session = new voice.AgentSession({
            // Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand.
            // Self-hosted faster-whisper server (see adapters/stt.ts).
            stt: new CustomSTT({ baseUrl: envConfig.sttBaseUrl, language: 'hi' }),
            // A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
            // See all available models at https://docs.livekit.io/agents/models/llm/
            llm: new inference.LLM({ model: 'openai/gpt-4.1-mini'}),
            // Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
            // Self-hosted Kokoro server (see adapters/tts.ts).
            tts: new CustomTTS({ baseUrl: envConfig.ttsBaseUrl, language: 'hi' }),
            // VAD and turn detection are used to determine when the user is speaking and when the agent should respond
            // See more at https://docs.livekit.io/agents/build/turns
            vad: ctx.proc.userData.vad! as silero.VAD,
            // turnDetection: 'vad',
            // to use realtime model, replace the stt, llm, tts and vad with the following
            // llm: new openai.realtime.RealtimeModel(),
        });

        await session.start({
            agent: agent,
            room: ctx.room,
        });

        await session.generateReply({
            instructions: 'greet the user and ask about their day',
        });
    },
});

if (process.argv[1] === __filename) {
    logger.info(`Agent server starting with agent at ${__filename}`);
    cli.runApp(new ServerOptions({ agent: __filename, agentName: envConfig.agriAgentName }));
}