import { createTimedString, mergeFrames, normalizeLanguage, stt, type APIConnectOptions, type AudioBuffer } from '@livekit/agents';
import { calculateAudioDurationSeconds } from '@livekit/agents';
import { randomUUID } from 'node:crypto';
import envConfig from '../../../config/env.config';

type AudioFrame = ReturnType<typeof mergeFrames>;

export interface CustomSTTOptions {
    /** Base URL of your hosted STT server, e.g. 'http://localhost:8000' */
    baseUrl: string;
    /** Optional bearer token, sent as `Authorization: Bearer <apiKey>` when set */
    apiKey?: string;
    /** Language hint, e.g. 'hi' or 'en' (omit to let the server auto-detect) */
    language?: string;
    /** Request word-level timestamps from the server and emit them on the transcript */
    wordTimestamps?: boolean;
    /** Model name, only used for metrics */
    model: string;
    /** Per-request timeout in milliseconds (default 15000) */
    timeoutMs: number;
}

interface WhisperWord {
    text: string;
    start: number;
    end: number;
}

interface WhisperResult {
    success: boolean;
    message?: string;
    data?: {
        transcript: string;
        language: string;
        confidence: number;
        words?: WhisperWord[];
    };
}

/**
 * Custom STT adapter for a self-hosted faster-whisper server.
 *
 * The server contract (one VAD-segmented utterance per request, raw mono s16le
 * PCM in the body, sample rate in the `X-Sample-Rate` header) matches the
 * LiveKit `stt.StreamAdapter`: capabilities are set to `streaming: false`, so
 * the voice agent automatically wraps this instance in a `StreamAdapter` that
 * runs the session VAD (silero) to segment audio into utterances before each
 * `_recognize` call.
 */
export class STT extends stt.STT {
    private opts: CustomSTTOptions;
    private sampleRateReported = false;
    label = 'custom.STT';

    get provider(): string {
        return 'Whisper';
    }

    get model(): string {
        return this.opts.model;
    }

    constructor(opts: Partial<CustomSTTOptions> = {}) {
        super({ streaming: false, interimResults: false });

        this.opts = {
            baseUrl: opts.baseUrl ?? envConfig.sttBaseUrl ?? 'http://localhost:8000',
            wordTimestamps: opts.wordTimestamps ?? false,
            model: opts.model ?? 'faster-whisper',
            timeoutMs: opts.timeoutMs ?? 15_000,
            ...(opts.apiKey !== undefined ? { apiKey: opts.apiKey } : {}),
            ...(opts.language !== undefined ? { language: opts.language } : {}),
        };
    }

    async _recognize(buffer: AudioBuffer, abortSignal?: AbortSignal): Promise<stt.SpeechEvent> {
        const tStart = performance.now();
        const frame = mergeFrames(buffer);
        const { data: pcm, sampleRate } = downmixToMono(frame);
        const requestId = randomUUID();
        const audioSec = calculateAudioDurationSeconds(frame);

        console.log('[stt.start]', { requestId, audioSec: audioSec.toFixed(3), sampleRate, bytes: pcm.byteLength }, 'custom STT: recognize started');

        // Frames arrive at the silero VAD sample rate (16 kHz mono s16le). The
        // header announces the real rate so the server resamples to 16 kHz itself.
        if (!this.sampleRateReported) {
            this.sampleRateReported = true;
            console.debug('[stt.format]', { sampleRate, channels: frame.channels, frames: pcm.byteLength / 2 }, 'custom STT: utterance format');
        }

        const baseUrl = this.opts.baseUrl.replace(/\/+$/, '');
        const url = new URL(`${baseUrl}/transcribe-pcm`);
        url.searchParams.set('request_id', requestId);
        if (this.opts.language) {
            url.searchParams.set('language', this.opts.language);
        }
        if (this.opts.wordTimestamps) {
            url.searchParams.set('word_timestamps', 'true');
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/octet-stream',
            'X-Sample-Rate': String(sampleRate),
        };
        if (this.opts.apiKey) {
            headers['Authorization'] = `Bearer ${this.opts.apiKey}`;
        }

        const timeout = AbortSignal.timeout(this.opts.timeoutMs);
        const signal = abortSignal ? AbortSignal.any([abortSignal, timeout]) : timeout;

        const resp = await fetch(url, {
            method: 'POST',
            headers,
            body: new Uint8Array(pcm),
            signal,
        });

        if (!resp.ok) {
            console.error('[stt.error]', { status: resp.status, requestId }, 'custom STT request failed');
            throw new Error(
                `custom STT request failed with status ${resp.status}: ${await resp.text()}`,
            );
        }

        let result: WhisperResult;
        try {
            result = (await resp.json()) as WhisperResult;
        } catch {
            throw new Error('custom STT returned a non-JSON response');
        }

        if (!result.success) {
            console.error('[stt.error]', { requestId, message: result.message }, 'custom STT reported a failed transcription');
            throw new Error(`custom STT failed: ${result.message ?? 'unknown error'}`);
        }

        const data = result.data;
        if (!data || typeof data.transcript !== 'string') {
            throw new Error('custom STT response is missing data.transcript');
        }

        const text = data.transcript;
        const language = (data.language || this.opts.language || 'en').toLowerCase();
        const confidence = data.confidence ?? 0.0;

        const speechData: stt.SpeechData = {
            language: normalizeLanguage(language),
            text,
            startTime: 0,
            endTime: calculateAudioDurationSeconds(frame),
            confidence,
            ...(this.opts.wordTimestamps && data.words?.length
                ? {
                      words: data.words.map((word) =>
                          createTimedString({
                              text: word.text,
                              startTime: word.start,
                              endTime: word.end,
                              confidence,
                          }),
                      ),
                  }
                : {}),
        };

        const durationMs = performance.now() - tStart;
        console.log('[stt.done]', { requestId, durationMs: Math.round(durationMs), audioSec: audioSec.toFixed(3), text, confidence }, 'custom STT: recognize completed');

        return {
            type: stt.SpeechEventType.FINAL_TRANSCRIPT,
            requestId,
            alternatives: [speechData],
        };
    }

    stream(options?: { connOptions?: APIConnectOptions }): SpeechStream {
        return new SpeechStream(this, options?.connOptions);
    }
}

/**
 * Flush-based streaming fallback. In the normal voice-agent flow a
 * non-streaming STT is wrapped in a `stt.StreamAdapter` (segmenting via the
 * session VAD), so this stream is only used when the STT is consumed directly.
 */
export class SpeechStream extends stt.SpeechStream {
    #stt: STT;
    label = 'custom.SpeechStream';

    constructor(stt: STT, connOptions?: APIConnectOptions) {
        super(stt, undefined, connOptions);
        this.#stt = stt;
    }

    protected async run(): Promise<void> {
        let frames: AudioFrame[] = [];

        for (;;) {
            const result = await this.input.next();
            if (result.done) break;

            const value = result.value;
            if (value === SpeechStream.FLUSH_SENTINEL) {
                if (frames.length > 0) {
                    await this.#recognize(frames);
                    frames = [];
                }
            } else {
                frames.push(value);
            }
        }

        if (frames.length > 0) {
            await this.#recognize(frames);
        }
    }

    async #recognize(frames: AudioFrame[]): Promise<void> {
        try {
            const event = await this.#stt.recognize(frames, this.abortSignal);
            const text = event.alternatives?.[0]?.text;

            if (!text) {
                return;
            }

            this.queue.put({ type: stt.SpeechEventType.START_OF_SPEECH });
            this.queue.put(event);
            this.queue.put({ type: stt.SpeechEventType.END_OF_SPEECH });
        } catch (error) {
            console.error('[stt.error]', { error }, 'custom STT recognize failed');
        }
    }
}

function downmixToMono(frame: AudioFrame): { data: Buffer; sampleRate: number } {
    const { data, sampleRate } = frame;

    if (frame.channels === 1) {
        return {
            data: Buffer.from(data.buffer, data.byteOffset, data.byteLength),
            sampleRate,
        };
    }

    const mono = new Int16Array(frame.samplesPerChannel);
    for (let i = 0; i < frame.samplesPerChannel; i++) {
        let sum = 0;
        for (let c = 0; c < frame.channels; c++) {
            sum += data[i * frame.channels + c] ?? 0;
        }
        mono[i] = sum / frame.channels;
    }

    return { data: Buffer.from(mono.buffer), sampleRate };
}