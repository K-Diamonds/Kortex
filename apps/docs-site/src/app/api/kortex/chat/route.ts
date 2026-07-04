const REPLIES = [
  'Install with: pnpm add @kortex/ui react react-dom — then render <Kortex apiEndpoint="/api/kortex/chat" />. See /packages/chat/quickstart.',
  'KortexProps: apiEndpoint (required), title, theme, variant, position, memory, rag, tools, stream, className, style, and callbacks onOpen/onClose/onMessage. Full table at /packages/chat/props.',
  'For Vue/Svelte/HTML: import registerKortexElement from "@kortex/ui/element", then use <kortex-ui api-endpoint="...">. See /packages/chat/web-component.',
  'React/Next.js: import { Kortex } from "@kortex/ui" in a client component. Never pass API keys — only apiEndpoint. Backend setup: /backend-route.',
  'Customize colors with className or style on the chat panel. Example at /packages/chat/theming.',
  'position supports bottom-right and bottom-left for variant="widget". See /packages/chat/configuration.',
  'onMessage receives { role, content, timestamp? }. onResponse receives { content, model?, context? }. See /packages/chat/events.',
  'Your backend owns provider, model, tokens, database, vector store, RAG, MCP, tools, and agents. UI only calls apiEndpoint.',
  'The live widget on this page is @kortex/ui from the monorepo. Try /packages/chat/demo for integration docs.',
  'React Native: pnpm add @kortex/react-native — same props where possible. See /packages/react-native.',
];

let replyIndex = 0;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: { message?: string };
  try {
    body = (await request.json()) as { message?: string };
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }

  const lower = message.toLowerCase();
  let content = REPLIES[replyIndex++ % REPLIES.length]!;

  if (lower.includes('install') || lower.includes('npm') || lower.includes('pnpm')) {
    content = REPLIES[0]!;
  } else if (lower.includes('prop') || lower.includes('option') || lower.includes('accept')) {
    content = REPLIES[1]!;
  } else if (lower.includes('vue') || lower.includes('svelte') || lower.includes('web component') || lower.includes('html')) {
    content = REPLIES[2]!;
  } else if (lower.includes('react') || lower.includes('next')) {
    content = REPLIES[3]!;
  } else if (lower.includes('color') || lower.includes('theme') || lower.includes('style') || lower.includes('custom')) {
    content = REPLIES[4]!;
  } else if (lower.includes('position') || lower.includes('corner')) {
    content = REPLIES[5]!;
  } else if (lower.includes('callback') || lower.includes('onmessage') || lower.includes('event')) {
    content = REPLIES[6]!;
  } else if (lower.includes('backend') || lower.includes('api key') || lower.includes('secret')) {
    content = REPLIES[7]!;
  }

  return Response.json({ content, model: 'kortex-docs' });
}
