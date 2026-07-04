import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ChatQuickstartPage() {
  return (
    <DocPage title="Quick Start">
      <SecurityNote />
      <p>Get the Kortex chat widget on your site in three steps.</p>

      <div className="docs-step">
        <p className="docs-step-label">
          <span>01</span> — Install
        </p>
        <Code>{`pnpm add @kortex/ui react react-dom`}</Code>
      </div>

      <div className="docs-step">
        <p className="docs-step-label">
          <span>02</span> — Add your backend route
        </p>
        <p>
          Create <code>POST /api/kortex/chat</code> using <code>@kortex/config</code>. See{' '}
          <Link href="/backend-route">Backend route setup</Link>.
        </p>
      </div>

      <div className="docs-step">
        <p className="docs-step-label">
          <span>03</span> — Render the widget
        </p>
        <Code>{`"use client";

import { Kortex } from "@kortex/ui";

export function Chat() {
  return (
    <Kortex
      apiEndpoint="/api/kortex/chat"
      title="Kortex"
      subtitle="Powered by Kortex"
      theme="dark"
      variant="widget"
      position="bottom-right"
      welcomeMessage="Neural link established. How can I assist?"
      suggestions={[
        "What can you help with?",
        "Tell me about pricing",
      ]}
    />
  );
}`}</Code>
      </div>

      <div className="docs-callout docs-callout-success">
        The diamond bubble appears in the corner of your site. No extra HTML required for{' '}
        <code>variant="widget"</code>.
      </div>

      <p>
        Next: <Link href="/packages/chat/configuration">Configuration</Link> ·{' '}
        <Link href="/packages/chat/examples/react">React example</Link> ·{' '}
        <Link href="/packages/chat/demo">Live demo</Link>
      </p>
    </DocPage>
  );
}
