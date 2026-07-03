import Link from 'next/link';

const nav = [
  { href: '/', label: 'Overview' },
  { href: '/getting-started', label: 'Getting Started' },
  { href: '/providers', label: 'Providers' },
  { href: '/memory-vector', label: 'Memory & Vector' },
  { href: '/rag', label: 'RAG' },
  { href: '/mcp-agents', label: 'MCP & Agents' },
  { href: '/docker', label: 'Docker' },
  { href: '/configuration', label: 'Configuration' },
];

export function DocsNav() {
  return (
    <nav
      style={{
        borderBottom: '1px solid #27272a',
        padding: '1rem 1.5rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        fontSize: 14,
      }}
    >
      <strong style={{ marginRight: '0.5rem' }}>Kortex v1.0</strong>
      {nav.map((item) => (
        <Link key={item.href} href={item.href} style={{ color: '#a78bfa', textDecoration: 'none' }}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function DocPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{title}</h1>
      {children}
    </main>
  );
}

export function Code({ children }: { children: string }) {
  return (
    <pre
      style={{
        background: '#18181b',
        padding: '1rem',
        borderRadius: 8,
        overflow: 'auto',
        fontSize: 13,
        margin: '1rem 0',
      }}
    >
      {children}
    </pre>
  );
}
