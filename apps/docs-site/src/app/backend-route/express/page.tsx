import Link from 'next/link';
import { Code, DocPage } from '@/components/Docs';

export default function BackendRouteExpressPage() {
  return (
    <DocPage title="Express route">
      <Code>{`import express from "express";
import { createKortexFromEnv } from "@kortex/config";

const app = express();
app.use(express.json());

let runtimePromise: ReturnType<typeof createKortexFromEnv> | null = null;

function getKortex() {
  runtimePromise ??= createKortexFromEnv();
  return runtimePromise;
}

app.post("/api/kortex/chat", async (req, res) => {
  try {
    const { message, userId, sessionId, memory, rag } = req.body ?? {};

    if (!message?.trim() || !userId || !sessionId) {
      res.status(400).json({ error: "message, userId, sessionId required" });
      return;
    }

    const kortex = await getKortex();
    const response = await kortex.chat({
      userId,
      sessionId,
      message: message.trim(),
      useMemory: Boolean(memory),
      useRag: Boolean(rag),
    });

    res.json({ content: response.content, model: response.model });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errMsg });
  }
});

app.listen(3000);`}</Code>
      <p>
        Load <code>.env</code> before bootstrap (e.g. <code>dotenv/config</code>).{' '}
        <Link href="/getting-started/minimum-setup">Minimum setup</Link>
      </p>
    </DocPage>
  );
}
