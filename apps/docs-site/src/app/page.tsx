import Link from 'next/link';
import { Code, DocPage } from '@/components/Docs';
import { DiamondIcon } from '@/components/DiamondIcon';

export default function Home() {
  return (
    <DocPage title="">
      <div className="docs-hero">
        <div className="docs-hero-badges">
          <span className="docs-pill docs-pill-cyan">0.1.0-alpha</span>
          <span className="docs-pill docs-pill-green">Developer preview</span>
        </div>
        <div className="docs-hero-logo">
          <DiamondIcon size={48} />
        </div>
        <h1 className="docs-hero-title">KORTEX</h1>
        <p className="docs-hero-tagline">AI RUNTIME FOR TYPESCRIPT — DEPLOY ANYWHERE</p>
        <p className="docs-hero-desc">
          Provider-agnostic backend runtime with memory, vector search, RAG, MCP tools, and agents.
          Drop-in <code>&lt;Kortex /&gt;</code> chat widget for React, Next.js, and React Native — or{' '}
          <code>&lt;kortex-ui&gt;</code> for other web frameworks.
        </p>
        <div className="docs-hero-actions">
          <Link href="/getting-started" className="docs-btn docs-btn-primary">
            Get started
          </Link>
          <Link href="/getting-started/minimum-setup" className="docs-btn docs-btn-secondary">
            Minimum setup
          </Link>
          <Link href="/packages/ui" className="docs-btn docs-btn-secondary">
            @kortex/ui docs
          </Link>
        </div>
        <div className="docs-glow-divider" />
        <h2>Quick install</h2>
        <Code>{`pnpm add @kortex/core @kortex/config @kortex/ui`}</Code>
        <Code>{`import { Kortex } from "@kortex/ui";

<Kortex
  apiEndpoint="/api/kortex/chat"
  title="Kortex"
  theme="dark"
  variant="widget"
/>`}</Code>
        <p className="docs-muted">
          The floating chat widget on this page is <code>@kortex/ui</code> from the monorepo. See{' '}
          <Link href="/packages/ui">Chat UI packages</Link> or ask the widget about backend setup
          and package docs.
        </p>
      </div>
    </DocPage>
  );
}
