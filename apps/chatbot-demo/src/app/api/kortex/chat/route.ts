import { getKortex } from '@/lib/kortex';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

interface KortexChatBody {
  message: string;
  userId: string;
  sessionId: string;
  agentId?: string;
  memory?: boolean;
  rag?: boolean;
  tools?: boolean;
  stream?: boolean;
  metadata?: Record<string, unknown>;
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
  let body: KortexChatBody;

  try {
    body = (await request.json()) as KortexChatBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    message,
    userId,
    sessionId,
    agentId,
    memory = false,
    rag = false,
    tools: _tools = false,
    stream = true,
    metadata,
  } = body;

  if (!message?.trim()) {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }
  if (!userId?.trim() || !sessionId?.trim()) {
    return Response.json({ error: 'userId and sessionId are required' }, { status: 400 });
  }

  const kortex = await getKortex();

  if (!stream) {
    try {
      if (agentId) {
        const response = await kortex.runAgent(agentId, message.trim(), {
          userId,
          sessionId,
        });
        return Response.json({ content: response.content, model: response.model });
      }

      const response = await kortex.chat({
        userId,
        sessionId,
        message: message.trim(),
        useMemory: memory,
        useRag: rag,
      });
      return Response.json({
        content: response.content,
        model: response.model,
        context: response.retrievedContext?.chunks.map((chunk) => chunk.content),
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      return Response.json({ error: errMsg }, { status: 500 });
    }
  }

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const toolResult = await tryRunTool(message, kortex);
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

        if (agentId) {
          const response = await kortex.runAgent(agentId, message.trim(), {
            userId,
            sessionId,
          });
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'chunk', content: response.content, model: response.model })}\n\n`,
            ),
          );
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
          return;
        }

        if (rag) {
          try {
            const context = await kortex.retrieveContext({
              query: message.trim(),
              userId,
              sessionId,
            });
            const chunks = context.chunks.map((chunk) => chunk.content);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'context', context: chunks })}\n\n`),
            );
          } catch {
            // optional vector backend
          }
        }

        for await (const chunk of kortex.stream({
          userId,
          sessionId,
          message: message.trim(),
          useMemory: memory,
          useRag: rag,
        })) {
          if (chunk.content) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'chunk', content: chunk.content, model: chunk.model })}\n\n`,
              ),
            );
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', metadata })}\n\n`));
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

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
