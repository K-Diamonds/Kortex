import type { NextRequest } from 'next/server';
import { getKortex } from '@/lib/kortex';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text: string;
      userId?: string;
      sessionId?: string;
      aiProvider?: string;
    };

    if (!body.text?.trim()) {
      return Response.json({ error: 'text is required' }, { status: 400 });
    }

    const kortex = await getKortex();
    const chunks = await kortex.ingest({
      documents: [{ content: body.text.trim(), metadata: { source: 'upload' } }],
      userId: body.userId,
      sessionId: body.sessionId,
    });

    return Response.json({ chunks: chunks.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ingest failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
