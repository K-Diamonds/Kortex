import Link from 'next/link';
import { Code, DocPage } from '@/components/Docs';

export default function BackendRouteFastifyPage() {
  return (
    <DocPage title="Fastify route">
      <Code>{`import Fastify from "fastify";
import { createKortexFromEnv } from "@kortex/config";

const app = Fastify({ logger: true });

let runtimePromise: ReturnType<typeof createKortexFromEnv> | null = null;

function getKortex() {
  runtimePromise ??= createKortexFromEnv();
  return runtimePromise;
}

app.post("/api/kortex/chat", async (request, reply) => {
  const { message, userId, sessionId, memory, rag } = request.body as {
    message?: string;
    userId?: string;
    sessionId?: string;
    memory?: boolean;
    rag?: boolean;
  };

  if (!message?.trim() || !userId || !sessionId) {
    return reply.status(400).send({ error: "message, userId, sessionId required" });
  }

  const kortex = await getKortex();
  const response = await kortex.chat({
    userId,
    sessionId,
    message: message.trim(),
    useMemory: Boolean(memory),
    useRag: Boolean(rag),
  });

  return { content: response.content, model: response.model };
});

await app.listen({ port: 3000, host: "0.0.0.0" });`}</Code>
      <p>
        <Link href="/backend-route/express">Express example</Link> ·{' '}
        <Link href="/getting-started/minimum-setup">Minimum setup</Link>
      </p>
    </DocPage>
  );
}
