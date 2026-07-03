'use client';

import { Kortex } from '@kortex/ui';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0d1b2a]">
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
