import type { NextRequest } from 'next/server';
import { loadConfig } from '@kortex/config';

export const runtime = 'nodejs';

const PROVIDERS = [
  'openai',
  'anthropic',
  'gemini',
  'openrouter',
  'ollama',
  'lmstudio',
  'openclaw',
  'hermes',
] as const;

export async function GET() {
  const config = loadConfig();
  return Response.json({
    aiProvider: config.aiProvider,
    aiModel: config.aiModel ?? config.openai.model,
    memoryProvider: config.memoryProvider,
    vectorProvider: config.vectorProvider,
    embeddingProvider: config.embeddingProvider,
    mcpEnabled: config.mcpEnabled,
    providers: PROVIDERS,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { aiProvider?: string; aiModel?: string };
    if (body.aiProvider && !PROVIDERS.includes(body.aiProvider as (typeof PROVIDERS)[number])) {
      return Response.json({ error: 'Invalid aiProvider' }, { status: 400 });
    }
    return Response.json({
      aiProvider: body.aiProvider ?? loadConfig().aiProvider,
      aiModel: body.aiModel,
      note: 'Pass aiProvider on /api/chat requests to use a provider for that session.',
    });
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
