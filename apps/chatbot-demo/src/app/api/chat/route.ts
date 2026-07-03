import type { NextRequest } from 'next/server';
import { getKortex } from '@/lib/kortex';

export const runtime = 'nodejs';

interface ChatRequestBody {
  message: string;
  userId: string;
  sessionId: string;
  useMemory?: boolean;
  useRag?: boolean;
  aiProvider?: string;
  aiModel?: string;
}

async function tryRunTool(
  message: string,
  kortex: Awaited<ReturnType<typeof getKortex>>,
): Promise<string | null> {
  const trimmed = message.trim();
  if (!trimmed.startsWith('/tool ')) return null;

  const rest = trimmed.slice(6).trim();
  const space = rest.indexOf(' ');
  const name = space === -1 ? rest : rest.slice(0, space);
  const argsRaw = space === -1 ? '{}' : rest.slice(space + 1);

  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(argsRaw) as Record<string, unknown>;
  } catch {
    throw new Error('Tool args must be valid JSON, e.g. /tool get_current_time {}');
  }

  const result = await kortex.runTool(name, args);
  return `${name}: ${JSON.stringify(result)}`;
}

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    message,
    userId,
    sessionId,
    useMemory = false,
    useRag = false,
    aiProvider,
    aiModel,
  } = body;

  if (!message?.trim()) {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }
  if (!userId?.trim() || !sessionId?.trim()) {
    return Response.json({ error: 'userId and sessionId are required' }, { status: 400 });
  }

  const ai = await getKortex({ aiProvider, aiModel });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const toolResult = await tryRunTool(message, ai);
        if (toolResult) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'tools', tools: toolResult })}\n\n`),
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'chunk', content: `Tool result: ${toolResult}` })}\n\n`,
            ),
          );
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
          return;
        }

        if (useRag) {
          try {
            const context = await ai.retrieveContext({
              query: message.trim(),
              userId,
              sessionId,
            });
            const chunks = context.chunks.map((c) => c.content);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'context', context: chunks })}\n\n`),
            );
          } catch {
            // vector optional
          }
        }

        for await (const chunk of ai.stream({
          userId,
          sessionId,
          message: message.trim(),
          useMemory,
          useRag,
        })) {
          if (chunk.content) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'chunk', content: chunk.content })}\n\n`,
              ),
            );
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errMsg })}\n\n`),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
