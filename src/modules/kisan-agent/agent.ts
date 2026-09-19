import { type JobContext, type JobProcess,  type LLM, ServerOptions, cli, defineAgent, llm, voice, Agent, dedent, inference } from '@livekit/agents';
import { LLM as OpenAIOllamaLLM } from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import { z } from 'zod';
import { STT as CustomSTT } from './adapters/stt';
import { TTS as CustomTTS } from './adapters/tts';
import { LLM as OllamaLLM } from './adapters/llm';
import { envConfig, logger } from '../../config';
import askKrishiAssistant from './tools/ask-krishi-assistant';


export function createAgent(llm: LLM) {
    const agent = Agent.create({
        instructions: dedent
            `You are an unbeat, slightly sarcastic female voice AI for Indian farmers, speaks in User's language.
            Help the farmers without rambling and keep replines in 3 sentences or less`,

        llm: llm,

        tools: [askKrishiAssistant],

    });

    return agent;
}

export default defineAgent({
    prewarm: async (proc: JobProcess) => {
        const t0 = performance.now();
        console.log('[agent.prewarm]', 'starting VAD load');
        proc.userData.vad = await silero.VAD.load();
        console.log('[agent.prewarm]', { durationMs: Math.round(performance.now() - t0) }, 'VAD loaded');
    },

    entry: async (ctx: JobContext) => {
        const t0 = performance.now();
        console.log('[agent.entry]', 'agent entry started');

        // const llm = new OpenAIOllamaLLM({
        //     model: envConfig.ollamaModel,
        //     // Ask AI host exposes the OpenAI-compatible API under /v1 (Ollama's chat completions route).
        //     baseURL: `${envConfig.ollamaBaseUrl.replace(/\/+$/, '')}/v1`,
        //     apiKey: envConfig.ollamaApiKey,
        //     temperature: 0.2,
        //     reasoningEffort: 'none',
        //     // think: true,
        // });

        // Custom LLM adapter talking to Ollama's native `/api/chat` (streaming, thinking disabled via `think: false`).
        const llm = new OllamaLLM({
            baseUrl: envConfig.ollamaBaseUrl,
            apiKey: envConfig.ollamaApiKey,
            model: envConfig.ollamaModel,
            temperature: 0.2,
        });

        const session = new voice.AgentSession({
            // Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand.
            // Self-hosted faster-whisper server (see adapters/stt.ts).
            stt: new CustomSTT({ baseUrl: envConfig.sttBaseUrl, language: 'hi' }),
            // A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
            // Self-hosted Ollama via the official OpenAI plugin (withOllama → /v1/chat/completions).
            llm,
            // Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
            // Self-hosted Kokoro server (see adapters/tts.ts).
            tts: new CustomTTS({ baseUrl: envConfig.ttsBaseUrl, language: 'hi', voice: "hf_alpha" }),
            // VAD and turn detection are used to determine when the user is speaking and when the agent should respond
            // See more at https://docs.livekit.io/agents/build/turns
            vad: ctx.proc.userData.vad! as silero.VAD,
            // to use realtime model, replace the stt, llm, tts and vad with the following
            // turnDetection: new livekitPlugin.turnDetector.MultilingualModel(),
            turnDetection: new inference.TurnDetector(),
            // llm: new openai.realtime.RealtimeModel(),
        });

        await session.start({
            agent: createAgent(llm),
            room: ctx.room,
        });

        console.log('[agent.session]', { durationMs: Math.round(performance.now() - t0) }, 'session started');

        const tReply = performance.now();
        await session.generateReply({
            instructions: 'greet the user and ask how you can help them today in hindi language.',
        });
        console.log('[agent.greeting]', { durationMs: Math.round(performance.now() - tReply) }, 'greeting reply sent');
    },
});

if (process.argv[1] === __filename) {
    logger.info(`Starting agent server with agent at ${__filename} and name ${envConfig.agriAgentName}`);

    cli.runApp(
        new ServerOptions({
            agent: __filename,
            agentName: envConfig.agriAgentName,
            apiKey: envConfig.livekitApiKey,
            apiSecret: envConfig.livekitApiSecret,
            wsURL: envConfig.livekitUrl,
        }),
    );
}