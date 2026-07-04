import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

const features = [
  { label: 'Framework agnostic', sub: 'React, Vue, Svelte, HTML' },
  { label: 'Cyber widget theme', sub: 'Diamond toggle + cyan UI' },
  { label: 'className + style', sub: 'Full panel theming' },
];

const docLinks = [
  { href: '/packages/ui/quickstart', label: 'Quick Start', desc: 'Online in 3 steps' },
  { href: '/getting-started/installation-by-use-case', label: 'Install by use case', desc: 'UI, backend, Postgres' },
  { href: '/getting-started/minimum-setup', label: 'Minimum setup', desc: 'OpenAI + widget only' },
  { href: '/packages/ui/install', label: 'npm install', desc: 'Package managers' },
  { href: '/packages/ui/web-component', label: 'Web Component', desc: 'Vue, Svelte, HTML' },
  { href: '/packages/ui/props', label: 'Props reference', desc: 'Full KortexProps table' },
  { href: '/packages/ui/demo', label: 'Live demo', desc: 'Widget on this site' },
];

export default function UiPackagePage() {
  return (
    <DocPage title="">
      <div className="docs-chat-intro">
        <div className="docs-hero-badges">
          <span className="docs-pill docs-pill-cyan">@kortex/ui</span>
          <span className="docs-pill docs-pill-green">0.1.0-alpha</span>
        </div>
        <h1 className="docs-chat-intro-title">@kortex/ui</h1>
        <p className="docs-chat-intro-tagline">CHAT WIDGET — DEPLOY ON ANY SITE</p>
        <p className="docs-chat-intro-desc">
          Drop-in <code>&lt;Kortex /&gt;</code> for React/Next.js, or <code>&lt;kortex-ui&gt;</code>{' '}
          for other web stacks. Point at your backend <code>apiEndpoint</code> — secrets stay
          server-side.
        </p>
      </div>

      <SecurityNote />

      <div className="docs-feature-grid">
        {features.map((f) => (
          <div key={f.label} className="docs-feature-card">
            <strong>{f.label}</strong>
            <span>{f.sub}</span>
          </div>
        ))}
      </div>

      <h2>Documentation</h2>
      <div className="docs-doc-grid">
        {docLinks.map((item) => (
          <Link key={item.href} href={item.href} className="docs-doc-card">
            <span className="docs-doc-card-label">{item.label}</span>
            <span className="docs-doc-card-desc">{item.desc}</span>
          </Link>
        ))}
      </div>

      <h2>Exports</h2>
      <Code>{`export { Kortex } from "@kortex/ui";
export type { KortexProps, KortexResponse, KortexRequestBody } from "@kortex/ui";

// Web Component: import { registerKortexElement } from "@kortex/ui/element";`}</Code>

      <h2>Minimal example</h2>
      <Code>{`import { Kortex } from "@kortex/ui";

<Kortex apiEndpoint="/api/kortex/chat" title="Kortex" theme="dark" variant="widget" />`}</Code>
      <p>
        <Link href="/getting-started/minimum-setup">Minimum working setup</Link> ·{' '}
        <Link href="/backend-route">Backend routes</Link>
      </p>
    </DocPage>
  );
}
