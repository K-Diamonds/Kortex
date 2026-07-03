import type { NextRequest } from 'next/server';
import { getKortex } from '@/lib/kortex';

export const runtime = 'nodejs';

interface ChatRequestBody {
  message: string;
  userId: string;
  sessionId: string;
  useMemory?: boolean;
  useRag?: boolean;
}

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { message, userId, sessionId, useMemory = false, useRag = false } = body;

  if (!message?.trim()) {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }
  if (!userId?.trim() || !sessionId?.trim()) {
    return Response.json({ error: 'userId and sessionId are required' }, { status: 400 });
  }

  const kortex = await getKortex();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of kortex.stream({
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
