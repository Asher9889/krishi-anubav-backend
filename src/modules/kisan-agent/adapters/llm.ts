import {
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    type APIConnectOptions,
    type ChatChunk,
    type CompletionUsage,
    DEFAULT_API_CONNECT_OPTIONS,
    FunctionCall,
    type LLM as LiveKitLLM,
    LLM as BaseLLM,
    LLMStream as BaseLLMStream,
    log,
    toJsonSchema,
    type ChatContext,
    type ToolChoice,
    type ToolContext,
    type ToolContextLike,
} from '@livekit/agents';
import { randomUUID } from 'node:crypto';
import envConfig from '../../../config/env.config';

export interface OllamaLLMOptions {
    /** Base URL of the Ollama host, e.g. 'https://ask-ai.mssplonline.in' */
    baseUrl: string;
    /** Bearer token, sent as `Authorization: Bearer <apiKey>` */
    apiKey: string;
    /** Ollama model name, e.g. 'qwen3:8b' */
    model: string;
    /** Sampling temperature (default 0.7) */
    temperature: number;
    /** Per-request timeout in milliseconds (default 120000) */
    timeoutMs: number;
}

interface OllamaToolCall {
    id?: string;
    function?: {
        name?: string;
        arguments?: string | Record<string, unknown>;
    };
}

interface OllamaChunk {
    model?: string;
    created_at?: string;
    message?: {
        role?: string;
        content?: string;
        thinking?: string;
        tool_calls?: OllamaToolCall[];
    };
    done?: boolean;
    error?: string;
    prompt_eval_count?: number;
    prompt_eval_cached_count?: number;
    eval_count?: number;
}

interface OllamaMessage {
    role: string;
    content?: string;
    tool_calls?: Array<{ function: { name: string; arguments: unknown } }>;
    name?: string;
}

const THINKING_BLOCK =
    /<\s*thinking\b[^>]*>[\s\S]*?<\/\s*thinking\s*>|<\s*\/?\s*think\s*>|```?thinking[\s\S]*?```?/gi;

function contentOf(message: OllamaMessage): string {
    return (message.content ?? '').replace(THINKING_BLOCK, '').trim();
}

function parseArgs(raw: string): unknown {
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

/**
 * Convert a LiveKit `ChatContext` into Ollama `messages`, grouping consecutive
 * assistant tool calls with their outputs and mapping roles for Ollama.
 */
export function toOllamaMessages(chatCtx: ChatContext): OllamaMessage[] {
    const messages: OllamaMessage[] = [];

    const pushTextMessage = (role: string, content: string) => {
        if (role === 'developer') role = 'system';
        if (role !== 'system' && role !== 'user' && role !== 'assistant') return;
        const text = content.replace(THINKING_BLOCK, '').trim();
        const last = messages[messages.length - 1];
        if (
            last &&
            last.role === role &&
            !last.tool_calls &&
            role !== 'user' &&
            (role === 'assistant' || messages.length === 1)
        ) {
            last.content = [contentOf(last), text].filter(Boolean).join('\n');
        } else {
            messages.push({ role, content: text });
        }
    };

    for (const item of chatCtx.items) {
        if (item.type === 'message') {
            pushTextMessage(item.role, item.rawTextContent ?? '');
        } else if (item.type === 'function_call') {
            const call = { function: { name: item.name, arguments: parseArgs(item.args) } };
            const last = messages[messages.length - 1];
            if (last && last.role === 'assistant') {
                last.tool_calls ??= [];
                last.tool_calls.push(call);
                last.content ??= '';
            } else {
                messages.push({ role: 'assistant', content: '', tool_calls: [call] });
            }
        } else if (item.type === 'function_call_output') {
            messages.push({ role: 'tool', content: item.output, name: item.name });
        }
    }

    if (!messages.some((m) => m.role === 'user')) {
        messages.push({ role: 'user', content: 'Start the conversation with a brief greeting.' });
    }

    return messages;
}

/**
 * Custom LLM adapter for a hosted Ollama server through its native
 * `POST /api/chat` streaming API.
 */
export class LLM extends BaseLLM {
    public readonly opts: OllamaLLMOptions;
    private logger = log();
    label(): string {
        return 'ollama.LLM';
    }

    get provider(): string {
        return 'ollama';
    }

    get model(): string {
        return this.opts.model;
    }

    constructor(opts: Partial<OllamaLLMOptions> = {}) {
        super();
        this.opts = {
            baseUrl: opts.baseUrl ?? envConfig.ollamaBaseUrl ?? 'https://ask-ai.mssplonline.in',
            apiKey: opts.apiKey ?? envConfig.ollamaApiKey ?? '',
            model: opts.model ?? envConfig.ollamaModel ?? 'qwen3:4b',
            temperature: opts.temperature ?? 0.7,
            timeoutMs: opts.timeoutMs ?? 120_000,
        };
    }

    chat({
        chatCtx,
        toolCtx,
        connOptions,
        parallelToolCalls,
        toolChoice,
        extraKwargs,
    }: {
        chatCtx: ChatContext;
        toolCtx?: ToolContextLike;
        connOptions?: APIConnectOptions;
        parallelToolCalls?: boolean;
        toolChoice?: ToolChoice;
        extraKwargs?: Record<string, unknown>;
    }): LLMStream {
        const resolved: APIConnectOptions = {
            maxRetry: connOptions?.maxRetry ?? DEFAULT_API_CONNECT_OPTIONS.maxRetry,
            retryIntervalMs:
                connOptions?.retryIntervalMs ?? DEFAULT_API_CONNECT_OPTIONS.retryIntervalMs,
            timeoutMs: connOptions?.timeoutMs ?? this.opts.timeoutMs,
        };
        const streamOpts: {
            chatCtx: ChatContext;
            toolCtx?: ToolContextLike;
            connOptions: APIConnectOptions;
        } = { chatCtx, connOptions: resolved };
        if (toolCtx !== undefined) {
            streamOpts.toolCtx = toolCtx;
        }
        return new LLMStream(this, streamOpts);
    }
}

/**
 * Streaming response stream for the Ollama adapter. Pushes text deltas as they
 * arrive (thinking tokens are discarded), then emits accumulated tool calls
 * and usage once the final chunk is received.
 */
export class LLMStream extends BaseLLMStream {
    #llm: LLM;
    #logger = log();
    label = 'ollama.LLMStream';

    constructor(
        llm: LLM,
        {
            chatCtx,
            toolCtx,
            connOptions,
        }: {
            chatCtx: ChatContext;
            toolCtx?: ToolContextLike;
            connOptions: APIConnectOptions;
        },
    ) {
        const baseArgs: {
            chatCtx: ChatContext;
            toolCtx?: ToolContextLike;
            connOptions: APIConnectOptions;
        } = { chatCtx, connOptions };
        if (toolCtx !== undefined) {
            baseArgs.toolCtx = toolCtx;
        }
        super(llm, baseArgs);
        this.#llm = llm;
    }

    protected async run(): Promise<void> {
        if (this.abortController.signal.aborted) return;

        const messages = toOllamaMessages(this.chatCtx);
        const tools = this.toolCtx
            ? Object.values(this.toolCtx.functionTools).map((tool) => ({
                type: 'function',
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: toJsonSchema(tool.parameters, false),
                },
            }))
            : undefined;

        const body: Record<string, unknown> = {
            model: this.#llm.model,
            messages,
            stream: true,
            options: { temperature: this.#llm.opts.temperature },
            think: false,
        };
        if (tools !== undefined && tools.length > 0) {
            body['tools'] = tools;
        }

        const url = `${this.#llm.opts.baseUrl.replace(/\/+$/, '')}/api/chat`;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.#llm.opts.apiKey) {
            headers['Authorization'] = `Bearer ${this.#llm.opts.apiKey}`;
        }

        const timeout = AbortSignal.timeout(this._connOptions.timeoutMs);
        const signal = AbortSignal.any([this.abortController.signal, timeout]);

        let resp: Response;
        try {
            resp = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                signal,
            });
        } catch (error) {
            if (this.abortController.signal.aborted) return;
            if (error instanceof Error && error.name === 'AbortError') {
                throw new APITimeoutError({
                    message: `POST /api/chat request timed out after ${this._connOptions.timeoutMs}ms`,
                });
            }
            throw new APIConnectionError({
                message: `POST /api/chat request failed: ${String(error)}`,
            });
        }

        if (!resp.ok) {
            const bodyText = await resp.text();
            this.#logger
                .child({ status: resp.status, body: bodyText.slice(0, 200) })
                .error('Ollama chat request failed');
            throw new APIStatusError({
                message: `Ollama chat request failed with status ${resp.status}: ${bodyText}`,
                options: {
                    statusCode: resp.status,
                    retryable:
                        resp.status === 429 ||
                        resp.status === 408 ||
                        resp.status === 401 ||
                        resp.status >= 500,
                    requestId: randomUUID(),
                    body: bodyText ? { error: bodyText } : null,
                },
            });
        }

        if (!resp.body) {
            throw new APIConnectionError({ message: 'Ollama chat returned no response body' });
        }

        const requestId = randomUUID();
        const toolCalls: OllamaToolCall[] = [];
        let usage: CompletionUsage | undefined;

        try {
            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            for (; ;) {
                const { done, value } = await reader.read();
                if (done || this.abortController.signal.aborted) break;
                buffer += decoder.decode(value, { stream: true });

                let newlineIndex: number;
                while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
                    const line = buffer.slice(0, newlineIndex).trim();
                    buffer = buffer.slice(newlineIndex + 1);
                    if (!line) continue;

                    let chunk: OllamaChunk;
                    try {
                        chunk = JSON.parse(line);
                    } catch {
                        continue;
                    }

                    if (chunk.error) {
                        throw new APIStatusError({
                            message: `Ollama chat returned error: ${chunk.error}`,
                            options: { statusCode: 500, retryable: true },
                        });
                    }

                    const message = chunk.message ?? {};
                    const content = message.content ?? '';
                    if (content.trim()) {
                        this.queue.put({ id: requestId, delta: { role: 'assistant', content } });
                    }

                    if (message.tool_calls?.length) {
                        toolCalls.push(...message.tool_calls);
                    }

                    if (chunk.done) {
                        usage = {
                            promptTokens: chunk.prompt_eval_count ?? 0,
                            completionTokens: chunk.eval_count ?? 0,
                            promptCachedTokens: chunk.prompt_eval_cached_count ?? 0,
                            totalTokens:
                                (chunk.prompt_eval_count ?? 0) + (chunk.eval_count ?? 0),
                        };
                    }
                }
            }

            if (toolCalls.length > 0) {
                const calls = toolCalls.map(
                    (tc) =>
                        new FunctionCall({
                            callId: tc.id ?? `call_${randomUUID()}`,
                            name: tc.function?.name ?? '',
                            args:
                                typeof tc.function?.arguments === 'string'
                                    ? tc.function.arguments
                                    : JSON.stringify(tc.function?.arguments ?? {}),
                        }),
                );
                this.queue.put({
                    id: requestId,
                    delta: { role: 'assistant' as const, toolCalls: calls },
                });
            }

            if (usage) {
                this.queue.put({ id: requestId, usage });
            }
        } catch (error) {
            if (this.abortController.signal.aborted) return;
            if (error instanceof Error && error.name === 'AbortError') {
                throw new APITimeoutError({
                    message: 'Ollama chat response read timed out',
                });
            }
            throw error;
        }
    }
}

export type { LiveKitLLM, ToolContext };