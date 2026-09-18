import {
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AudioByteStream,
    type APIConnectOptions,
    log,
    tts,
} from '@livekit/agents';
import { randomUUID } from 'node:crypto';
import envConfig from '../../../config/env.config';

export interface CustomTTSOptions {
    /** Base URL of your hosted TTS server, e.g. 'http://localhost:8001' */
    baseUrl: string;
    /** Optional bearer token, sent as `Authorization: Bearer <apiKey>` when set */
    apiKey?: string;
    /** Synthesis language, e.g. 'hi' or 'en' (server validates against its configured language) */
    language: string;
    /** Voice for the configured language; the server picks its default when omitted */
    voice?: string;
    /** Speaking rate, `0 < speed <= 3.0` (default 1.0) */
    speed: number;
    /** Model name, only used for metrics */
    model: string;
    /** Per-request timeout in milliseconds (default 15000) */
    timeoutMs: number;
}

/**
 * Custom TTS adapter for a self-hosted Kokoro server.
 *
 * The server contract (`POST /v1/tts/stream`, JSON body, raw mono s16le PCM
 * streamed back at `sample_rate`) is one-shot rather than incremental, so
 * capabilities are set to `streaming: false`. The voice agent automatically
 * wraps this instance in a `tts.StreamAdapter` that tokenizes LLM output into
 * sentences and calls `synthesize()` per sentence before audio is played.
 */
export class TTS extends tts.TTS {
    private opts: CustomTTSOptions;
    private logger = log();
    label = 'custom.TTS';

    get provider(): string {
        return 'krishi-local';
    }

    get model(): string {
        return this.opts.model;
    }

    constructor(opts: Partial<CustomTTSOptions> = {}) {
        super(44_100, 1, { streaming: false, alignedTranscript: false });

        this.opts = {
            baseUrl: opts.baseUrl ?? envConfig.ttsBaseUrl ?? 'http://localhost:8001',
            language: opts.language ?? 'hi',
            speed: opts.speed ?? 1.0,
            model: opts.model ?? 'kokoro',
            timeoutMs: opts.timeoutMs ?? 15_000,
            ...(opts.apiKey !== undefined ? { apiKey: opts.apiKey } : {}),
            ...(opts.voice !== undefined ? { voice: opts.voice } : {}),
        };
    }

    synthesize(
        text: string,
        connOptions?: APIConnectOptions,
        abortSignal?: AbortSignal,
    ): ChunkedStream {
        return new ChunkedStream(this, text, connOptions, abortSignal);
    }

    stream(options?: { connOptions?: APIConnectOptions }): Stream {
        return new Stream(this, options?.connOptions);
    }

    /**
     * Synthesise `text` against the Kokoro server and forward each audio packet
     * to `onAudio`. One HTTP call per sentence: the server streams raw PCM, which
     * is decoded into 20 ms-equivalent `AudioByteStream` frames. The final frame
     * of the segment carries `final: true`.
     */
    async synthesizeTo(
        text: string,
        requestId: string,
        onAudio: (value: tts.SynthesizedAudio) => void,
        abortSignal?: AbortSignal,
    ): Promise<void> {
        const trimmed = text.trim();
        if (!trimmed) {
            this.logger.child({ requestId }).warn('custom TTS: empty text, skipping');
            return;
        }

        const sampleRate = this.sampleRate;
        const numChannels = this.numChannels;
        const body: Record<string, unknown> = {
            text: trimmed,
            language: this.opts.language,
            sample_rate: sampleRate,
            request_id: requestId,
        };
        if (this.opts.voice) {
            body['voice'] = this.opts.voice;
        }
        if (this.opts.speed !== 1.0) {
            body['speed'] = this.opts.speed;
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.opts.apiKey) {
            headers['Authorization'] = `Bearer ${this.opts.apiKey}`;
        }

        const timeout = AbortSignal.timeout(this.opts.timeoutMs);
        const signal = abortSignal ? AbortSignal.any([abortSignal, timeout]) : timeout;

        const url = `${this.opts.baseUrl.replace(/\/+$/, '')}/v1/tts/stream`;

        let resp: Response;
        try {
            resp = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                signal,
            });
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new APITimeoutError({
                    message: `/v1/tts/stream request timed out after ${this.opts.timeoutMs}ms`,
                });
            }
            throw new APIConnectionError({
                message: `/v1/tts/stream request failed: ${String(error)}`,
            });
        }

        if (!resp.ok) {
            const bodyText = await resp.text();
            this.logger.child({ status: resp.status, requestId }).error('custom TTS request failed');
            throw new APIStatusError({
                message: `custom TTS request failed with status ${resp.status}: ${bodyText}`,
                options: {
                    statusCode: resp.status,
                    retryable: resp.status === 429 || resp.status >= 500,
                    requestId,
                    body: bodyText ? { error: bodyText } : null,
                },
            });
        }

        if (!resp.body) {
            throw new APIConnectionError({ message: 'custom TTS returned no response body' });
        }

        const headerSampleRate = Number(resp.headers.get('X-Sample-Rate'));
        const headerChannels = Number(resp.headers.get('X-Channels'));
        const outSampleRate =
            Number.isFinite(headerSampleRate) && headerSampleRate > 0
                ? headerSampleRate
                : sampleRate;
        const outChannels =
            Number.isFinite(headerChannels) && headerChannels > 0 ? headerChannels : numChannels;

        const decoder = new AudioByteStream(outSampleRate, outChannels);
        const segmentId = `${requestId}:s1`;
        let emitted = 0;
        let pending: tts.SynthesizedAudio | undefined;
        const pushFrame = (frame: tts.SynthesizedAudio['frame'], final: boolean) => {
            if (pending) {
                onAudio(pending);
            }
            pending = { requestId, segmentId, frame, final };
            emitted += 1;
        };

        try {
            const reader = resp.body.getReader();
            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                if (signal.aborted) break;
                if (value) {
                    for (const frame of decoder.write(value)) {
                        pushFrame(frame, false);
                    }
                }
            }
            for (const frame of decoder.flush()) {
                pushFrame(frame, false);
            }
            if (pending) {
                pending.final = true;
                onAudio(pending);
            }
            if (emitted === 0) {
                this.logger.child({ requestId }).warn('custom TTS returned no audio');
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new APITimeoutError({
                    message: `/v1/tts/stream response read timed out`,
                });
            }
            throw new APIConnectionError({
                message: `/v1/tts/stream response read failed: ${String(error)}`,
            });
        }
    }
}

/**
 * One-shot synthesis of a complete sentence. In the normal voice-agent flow a
 * non-streaming TTS is wrapped in a `tts.StreamAdapter` (tokenizing LLM output
 * into sentences), which iterates this stream's frames for audio playback.
 */
export class ChunkedStream extends tts.ChunkedStream {
    #tts: TTS;
    #logger = log();
    label = 'custom.TTS.ChunkedStream';

    constructor(
        tts: TTS,
        text: string,
        connOptions?: APIConnectOptions,
        abortSignal?: AbortSignal,
    ) {
        super(text, tts, connOptions, abortSignal);
        this.#tts = tts;
    }

    protected async run(): Promise<void> {
        const requestId = randomUUID();
        try {
            await this.#tts.synthesizeTo(
                this.inputText,
                requestId,
                (audio) => {
                    if (!this.abortController.signal.aborted) {
                        this.queue.put(audio);
                    }
                },
                this.abortSignal,
            );
        } catch (error) {
            this.#logger.child({ requestId, error }).error('custom TTS synthesize failed');
            throw error;
        }
    }
}

/**
 * Flush-based streaming fallback. In the normal voice-agent flow a
 * non-streaming TTS is wrapped in a `tts.StreamAdapter`, so this stream is only
 * used when the TTS is consumed directly.
 */
export class Stream extends tts.SynthesizeStream {
    #tts: TTS;
    #logger = log();
    label = 'custom.TTS.Stream';

    constructor(tts: TTS, connOptions?: APIConnectOptions) {
        super(tts, connOptions);
        this.#tts = tts;
    }

    protected async run(): Promise<void> {
        let buffer = '';

        for (;;) {
            const result = await this.input.next();
            if (result.done) break;
            const value = result.value;

            if (value === tts.SynthesizeStream.FLUSH_SENTINEL) {
                if (buffer.trim()) {
                    await this.#synthesize(buffer);
                    buffer = '';
                }
            } else {
                buffer += value;
            }
        }

        if (buffer.trim()) {
            await this.#synthesize(buffer);
        }
        this.queue.put(tts.SynthesizeStream.END_OF_STREAM);
    }

    async #synthesize(text: string): Promise<void> {
        const requestId = randomUUID();
        try {
            this.markStarted();
            await this.#tts.synthesizeTo(
                text,
                requestId,
                (audio) => {
                    if (!this.abortController.signal.aborted) {
                        this.queue.put(audio);
                    }
                },
                this.abortSignal,
            );
        } catch (error) {
            this.#logger.child({ requestId, error }).error('custom TTS synthesize failed');
        }
    }
}