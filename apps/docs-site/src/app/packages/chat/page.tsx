import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

const features = [
  { label: 'Framework agnostic', sub: 'React, Vue, Svelte, HTML' },
  { label: 'Cyber widget theme', sub: 'Diamond toggle + cyan UI' },
  { label: 'className + style', sub: 'Full panel theming' },
];

const docLinks = [
  { href: '/packages/chat/quickstart', label: 'Quick Start', desc: 'Online in 3 steps' },
  { href: '/packages/chat/install', label: 'Installation', desc: 'npm, yarn, pnpm' },
  { href: '/packages/chat/web-component', label: 'Web Component', desc: 'Vue, Svelte, HTML' },
  { href: '/packages/chat/configuration', label: 'Configuration', desc: 'Basic options' },
  { href: '/packages/chat/theming', label: 'Theming', desc: 'Colors, fonts, size' },
  { href: '/packages/chat/events', label: 'Events', desc: 'Callbacks & analytics' },
  { href: '/packages/chat/props', label: 'Props reference', desc: 'Full KortexProps table' },
  { href: '/packages/chat/demo', label: 'Live demo', desc: 'Try the widget on this site' },
];

export default function ChatPackagePage() {
  return (
    <DocPage title="">
      <div className="docs-chat-intro">
        <div className="docs-hero-badges">
          <span className="docs-pill docs-pill-cyan">@kortex/ui</span>
          <span className="docs-pill docs-pill-green">0.1.0-alpha</span>
        </div>
        <h1 className="docs-chat-intro-title">CHAT WIDGET</h1>
        <p className="docs-chat-intro-tagline">NEURAL CHAT INTERFACE — DEPLOY ON ANY SITE</p>
        <p className="docs-chat-intro-desc">
          A drop-in chat widget for React, Next.js, and every other web stack via{' '}
          <code>&lt;kortex-ui&gt;</code>. Point it at your backend <code>apiEndpoint</code> — secrets
          stay server-side. Install on your site in under a minute.
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
      <p>Everything you need to add Kortex chat to your own site:</p>
      <div className="docs-doc-grid">
        {docLinks.map((item) => (
          <Link key={item.href} href={item.href} className="docs-doc-card">
            <span className="docs-doc-card-label">{item.label}</span>
            <span className="docs-doc-card-desc">{item.desc}</span>
          </Link>
        ))}
      </div>

      <h2>Packages</h2>
      <ul>
        <li>
          <Link href="/packages/ui">@kortex/ui</Link> — web (React + Web Component)
        </li>
        <li>
          <Link href="/packages/react-native">@kortex/react-native</Link> — React Native
        </li>
      </ul>

      <h2>Minimal example</h2>
      <Code>{`import { Kortex } from "@kortex/ui";

<Kortex
  apiEndpoint="/api/kortex/chat"
  title="Kortex"
  theme="dark"
  variant="widget"
  position="bottom-right"
/>`}</Code>
      <p>
        Backend required — <Link href="/backend-route">Backend route setup</Link>
      </p>
    </DocPage>
  );
}
