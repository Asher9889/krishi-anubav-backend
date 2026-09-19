// tools/krishiAssistant.ts

import { tool } from '@livekit/agents';
import { z } from 'zod';
import { envConfig, logger } from '../../../config';

interface KrishiAssistantResult {
    success: boolean;
    answer: string;
    threadId?: string;
}

const askKrishiAssistant = tool({
    name: 'askKrishiAssistant',

    description: `
    Use this tool for questions related to agriculture and farming.

    This is the primary Krishi Assistant for the application. Use it for
    questions about crops, cultivation, sowing, harvesting, irrigation,
    fertilizers, pesticides, pests, crop diseases, soil, weather impacts on
    farming, mandi and agricultural markets, government agricultural schemes,
    livestock, and other questions relevant to farmers.

    The user may ask in Hindi, Hinglish, Roman Hindi, or English.

    For agriculture-related questions, prefer this tool instead of answering
    from your own knowledge.
    `,

    parameters: z.object({
        question: z
            .string()
            .min(1)
            .describe(
                'The complete question asked by the farmer.'
            ),
    }),

    execute: async ({
        question,
    }: {
        question: string;
    }): Promise<KrishiAssistantResult> => {
        const threadId = 'default';

        const startedAt = performance.now();

        logger.info(
            {
                question,
                threadId,
            },
            '[tool.askKrishiAssistant] request started',
        );

        try {
            const response = await fetch(
                `${envConfig.aiApiBaseUrl}/v4/ask`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'text/event-stream',
                    },

                    body: JSON.stringify({
                        thread_id: threadId,
                        text: question,
                    }),
                },
            );

            if (!response.ok) {
                const body = await response.text();

                throw new Error(
                    `Krishi Assistant returned ${response.status}: ${body}`,
                );
            }

            if (!response.body) {
                throw new Error(
                    'Krishi Assistant returned an empty response body',
                );
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = '';
            let answer = '';
            let returnedThreadId: string | undefined;

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, {
                    stream: true,
                });

                const lines = buffer.split('\n');

                buffer = lines.pop() ?? '';

                for (const rawLine of lines) {
                    const line = rawLine.trim();

                    if (!line || !line.startsWith('data:')) {
                        continue;
                    }

                    const payload = line
                        .slice('data:'.length)
                        .trim();

                    if (!payload || payload === '[DONE]') {
                        continue;
                    }

                    let event: any;

                    try {
                        event = JSON.parse(payload);
                    } catch {
                        logger.warn(
                            {
                                payload,
                            },
                            '[tool.askKrishiAssistant] invalid SSE payload',
                        );

                        continue;
                    }

                    const eventType = event.event;

                    if (eventType === 'metadata') {
                        const data = event.data ?? {};

                        if (data.thread_id) {
                            returnedThreadId = data.thread_id;
                        }

                        continue;
                    }

                    if (eventType === 'chunk') {
                        const content =
                            event.data?.content ?? '';

                        if (content) {
                            answer += content;
                        }

                        continue;
                    }

                    if (eventType === 'complete') {
                        const data = event.data ?? {};

                        if (data.thread_id) {
                            returnedThreadId = data.thread_id;
                        }

                        continue;
                    }
                }
            }

            // Process anything remaining in the buffer.
            if (buffer.trim().startsWith('data:')) {
                const payload = buffer
                    .trim()
                    .slice('data:'.length)
                    .trim();

                if (payload && payload !== '[DONE]') {
                    try {
                        const event = JSON.parse(payload);

                        if (event.event === 'chunk') {
                            answer +=
                                event.data?.content ?? '';
                        }

                        if (
                            event.event === 'metadata' &&
                            event.data?.thread_id
                        ) {
                            returnedThreadId =
                                event.data.thread_id;
                        }
                    } catch {
                        // Ignore incomplete final SSE payload.
                    }
                }
            }

            const durationMs =
                Math.round(performance.now() - startedAt);

            logger.info(
                {
                    durationMs,
                    answerLength: answer.length,
                    threadId: returnedThreadId ?? threadId,
                },
                '[tool.askKrishiAssistant] request completed',
            );

            if (!answer.trim()) {
                throw new Error(
                    'Krishi Assistant returned an empty answer',
                );
            }

            return {
                success: true,
                answer: answer.trim(),
                threadId: returnedThreadId ?? threadId,
            };
        } catch (error) {
            logger.error(
                {
                    error,
                    question,
                },
                '[tool.askKrishiAssistant] request failed',
            );

            throw error;
        }
    },
});

export default askKrishiAssistant;