import Link from 'next/link';
import { DocsChat } from './DocsChat';
import { DiamondIcon } from './DiamondIcon';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Introduction' },
      { href: '/getting-started', label: 'Getting Started' },
      { href: '/packages', label: 'Packages' },
    ],
  },
  {
    label: 'Backend',
    items: [
      { href: '/packages/core', label: '@kortex/core' },
      { href: '/packages/config', label: '@kortex/config' },
    ],
  },
  {
    label: 'Chat UI',
    items: [
      { href: '/packages/chat', label: 'Introduction' },
      { href: '/packages/chat/quickstart', label: 'Quick Start' },
      { href: '/packages/chat/install', label: 'Installation' },
      { href: '/packages/chat/web-component', label: 'Web Component' },
      { href: '/packages/chat/configuration', label: 'Configuration' },
      { href: '/packages/chat/theming', label: 'Theming' },
      { href: '/packages/chat/events', label: 'Events' },
      { href: '/packages/chat/props', label: 'Props reference' },
      { href: '/packages/chat/demo', label: 'Live demo' },
      { href: '/packages/chat/examples/react', label: 'Example: React' },
      { href: '/packages/chat/examples/vue', label: 'Example: Vue' },
      { href: '/packages/chat/examples/svelte', label: 'Example: Svelte' },
      { href: '/packages/chat/examples/vanilla', label: 'Example: HTML' },
      { href: '/packages/ui', label: '@kortex/ui package' },
      { href: '/packages/react-native', label: '@kortex/react-native' },
    ],
  },
  {
    label: 'Integration',
    items: [
      { href: '/backend-route', label: 'Backend Route' },
      { href: '/provider-setup', label: 'Provider Setup' },
      { href: '/providers', label: 'Providers' },
      { href: '/security', label: 'Security' },
      { href: '/publishing', label: 'Publishing' },
    ],
  },
  {
    label: 'Features',
    items: [
      { href: '/memory-vector', label: 'Memory & Vector' },
      { href: '/rag', label: 'RAG' },
      { href: '/mcp-agents', label: 'MCP & Agents' },
      { href: '/docker', label: 'Docker' },
      { href: '/configuration', label: 'Configuration' },
    ],
  },
];

export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        <div className="docs-sidebar-logo">
          <DiamondIcon size={32} />
          <div>
            <span className="docs-logo-text">KORTEX</span>
            <p className="docs-logo-sub">0.1.0-alpha</p>
          </div>
        </div>
        <nav className="docs-sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="docs-nav-section">
              <div className="docs-nav-section-label">{section.label}</div>
              {section.items.map((item) => (
                <Link key={item.href} href={item.href} className="docs-nav-link">
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="docs-sidebar-footer">
          <a href="https://github.com/KOfferman/Kortex" target="_blank" rel="noreferrer">
            GitHub →
          </a>
        </div>
      </aside>

      <div className="docs-main">
        <header className="docs-topbar">
          <span className="docs-breadcrumb">kortex / documentation</span>
          <span className="docs-badge">@kortex/ui</span>
        </header>
        <div className="docs-scanline" />
        <div className="docs-content-wrap">{children}</div>
      </div>

      <DocsChat />
    </div>
  );
}

export function DocPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="docs-page">
      {title ? <h1 className="docs-page-title">{title}</h1> : null}
      <div className="docs-page-body">{children}</div>
    </main>
  );
}

export function Code({ children }: { children: string }) {
  return (
    <pre className="docs-code">
      <code>{children}</code>
    </pre>
  );
}

export function SecurityNote() {
  return (
    <p className="docs-security-note">
      <strong>Security:</strong> The frontend never receives API keys or provider secrets. Your
      backend owns provider, model, tokens, database, vector store, RAG, MCP, tools, and agents.{' '}
      <code>.env</code> is highly recommended but not required — use any secure server-side config.{' '}
      <Link href="/security">Security</Link>
    </p>
  );
}

/** @deprecated Use DocsShell in layout — kept for gradual migration */
export function DocsNav() {
  return null;
}
