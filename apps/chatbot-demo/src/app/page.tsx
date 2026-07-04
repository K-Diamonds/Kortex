'use client';

import { Kortex } from '@kortex/ui';

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:3002';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0d1b2a]">
      <a
        href={DOCS_URL}
        className="fixed left-4 top-4 z-40 rounded-lg border border-cyan-500/30 bg-black/40 px-4 py-2 text-sm text-cyan-300 backdrop-blur hover:border-cyan-400/50"
      >
        Kortex documentation →
      </a>
      <Kortex
        apiEndpoint="/api/kortex/chat"
        title="Kortex Assistant"
        subtitle="AI runtime demo"
        theme="dark"
        variant="widget"
        memory
        rag
        tools
        stream
        markdown
      />
    </main>
  );
}
