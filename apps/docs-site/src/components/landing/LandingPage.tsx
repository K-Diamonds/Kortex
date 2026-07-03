import Link from 'next/link';
import { providers, statusColor } from '@/data/providers';
import { LandingNav } from './LandingNav';

const features = [
  {
    icon: '◇',
    title: 'Multi-LLM runtime',
    description:
      'Swap OpenAI, Anthropic, Gemini, OpenRouter, Ollama, and more via config. One KortexRuntime API for chat and streaming across vendors.',
    href: '/providers',
  },
  {
    icon: '⬡',
    title: 'Bring your own infrastructure',
    description:
      'You own the models, databases, and API keys. Kortex wires adapters together — cloud, on-prem, or local — without vendor lock-in.',
    href: '/configuration',
  },
  {
    icon: '◈',
    title: 'Memory',
    description:
      'Persist conversation history and long-term user memory with PostgreSQL or Redis. Scope state by userId and sessionId.',
    href: '/memory-vector',
  },
  {
    icon: '◎',
    title: 'Vector search',
    description:
      'Store and query embeddings with pgvector or Qdrant. Cosine similarity retrieval with configurable dimensions.',
    href: '/memory-vector',
  },
  {
    icon: '▣',
    title: 'RAG',
    description:
      'Ingest documents, chunk text, embed, retrieve relevant context, and inject it into prompts — all through the runtime.',
    href: '/rag',
  },
  {
    icon: '⚙',
    title: 'MCP tools',
    description:
      'Register MCP servers, list tools, and execute them via runTool(). Extend your backend without hardcoding integrations.',
    href: '/mcp-agents',
  },
  {
    icon: '◉',
    title: 'Agents',
    description:
      'Define agents with system instructions, memory, and tool access. Orchestrate multi-step workflows on top of the runtime.',
    href: '/mcp-agents',
  },
];

const whyKortex = [
  {
    title: 'Runtime, not a chatbot',
    description:
      'Kortex is the layer underneath your product — API routes, workers, and SaaS backends call KortexRuntime, not vendor SDKs directly.',
  },
  {
    title: 'Clean architecture boundaries',
    description:
      '@kortex/core defines interfaces only. Adapters live in separate packages and are wired via createKortexFromEnv() or dependency injection.',
  },
  {
    title: 'Testable by design',
    description:
      'Mock AIProvider, MemoryProvider, and VectorProvider in unit tests. Core orchestration stays pure and swappable.',
  },
  {
    title: 'TypeScript-first',
    description:
      'Strong types across chat, streaming, embeddings, memory, vectors, tools, and agents. Built for teams shipping typed AI backends.',
  },
];

const roadmap = [
  { done: true, label: 'Multi-LLM providers (OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio)' },
  { done: true, label: 'Postgres memory and pgvector vector store' },
  { done: true, label: 'Redis memory and Qdrant vectors' },
  { done: true, label: 'RAG ingestion pipeline' },
  { done: true, label: 'MCP tool integration' },
  { done: true, label: 'Agent orchestration' },
  { done: true, label: 'Reference chatbot demo and documentation site' },
  { done: false, label: 'npm publish for @kortex/* packages' },
  { done: false, label: 'OpenTelemetry observability' },
  { done: false, label: 'create-kortex-app CLI scaffolding' },
];

const ARCH_DIAGRAM = `┌─────────────────────────────────────┐
│         Your Application            │
│   API · Worker · CLI · Agent App    │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│         KortexRuntime               │
│  chat · stream · remember · ingest  │
│  retrieveContext · runTool · agent  │
└───┬─────────────┬─────────────┬─────┘
    │             │             │
    ▼             ▼             ▼
 AIProvider   MemoryProvider  VectorProvider
    │             │             │
    ▼             ▼             ▼
 @kortex/*     @kortex/*      @kortex/*
  adapters     adapters       adapters`;

function capability(value: boolean): string {
  return value ? 'Yes' : 'No';
}

export function LandingPage() {
  return (
    <div className="landing">
      <LandingNav />

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-container landing-hero-inner">
          <div className="landing-badge">
            <span className="landing-badge-dot" aria-hidden />
            0.1.0-alpha · developer preview
          </div>

          <p className="landing-hero-tagline">
            Kortex is the AI Infrastructure Runtime for TypeScript.
          </p>

          <h1>Build production-ready AI backends, not just AI calls.</h1>

          <p className="landing-hero-sub">
            Unify chat, streaming, memory, vector search, RAG, tools, and agents behind one
            testable runtime. Bring your own LLM, database, and vector store — swap adapters without
            rewriting your app.
          </p>

          <div className="landing-hero-actions">
            <Link href="/getting-started" className="landing-btn landing-btn-primary">
              Get started →
            </Link>
            <Link href="#architecture" className="landing-btn landing-btn-secondary">
              View architecture
            </Link>
          </div>

          <div className="landing-code-hero">
            <div className="landing-code-header">
              <span className="landing-code-dot" />
              <span className="landing-code-dot" />
              <span className="landing-code-dot" />
              <span className="landing-code-filename">bootstrap.ts</span>
            </div>
            <pre className="landing-code-body">
              <code>
                <span className="cm">{'// Wire everything from .env'}</span>
                {'\n'}
                <span className="kw">import</span> {'{ createKortexFromEnv }'}{' '}
                <span className="kw">from</span> <span className="str">&quot;@kortex/config&quot;</span>;
                {'\n\n'}
                <span className="kw">const</span> kortex = <span className="kw">await</span>{' '}
                <span className="fn">createKortexFromEnv</span>();
                {'\n\n'}
                <span className="kw">const</span> response = <span className="kw">await</span> kortex.
                <span className="fn">chat</span>({'{'}
                {'\n'}
                {'  '}userId: <span className="str">&quot;user_123&quot;</span>,{'\n'}
                {'  '}sessionId: <span className="str">&quot;session_456&quot;</span>,{'\n'}
                {'  '}message: <span className="str">&quot;Hello&quot;</span>,{'\n'}
                {'  '}useMemory: <span className="kw">true</span>,{'\n'}
                {'  '}useRag: <span className="kw">true</span>,{'\n'}
                {'}'});
              </code>
            </pre>
          </div>

          <p className="landing-alpha">
            <strong>Kortex is currently in alpha / developer preview.</strong> APIs and adapters may
            change before 1.0.0. OpenAI + Postgres + pgvector is the reference path.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2>Everything you need to ship an AI backend</h2>
            <p>
              One runtime orchestrates inference, persistence, retrieval, and tool execution. Enable
              only the capabilities your product needs.
            </p>
          </div>
          <div className="landing-grid landing-grid-3">
            {features.map((feature) => (
              <article key={feature.title} className="landing-card">
                <div className="landing-card-icon" aria-hidden>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link href={feature.href} className="landing-card-link">
                  Learn more →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2>Architecture</h2>
            <p>
              Clean boundaries between domain logic and infrastructure. Core never imports concrete
              adapters — you inject or bootstrap them at the edge.
            </p>
          </div>
          <div className="landing-arch">
            <pre className="landing-arch-diagram" aria-label="Architecture diagram">
              {ARCH_DIAGRAM}
            </pre>
            <ul className="landing-arch-points">
              <li>
                <strong>@kortex/core</strong>
                Interfaces and KortexRuntime orchestration. No OpenAI, Postgres, or MCP imports at
                compile time.
              </li>
              <li>
                <strong>@kortex/config</strong>
                createKortexFromEnv() loads the adapter matching AI_PROVIDER, MEMORY_PROVIDER, and
                VECTOR_PROVIDER.
              </li>
              <li>
                <strong>Adapter packages</strong>
                Each LLM, memory, and vector backend is a separate npm workspace package you can
                swap independently.
              </li>
              <li>
                <strong>Your application</strong>
                Calls KortexRuntime from API routes, workers, or agents. Own your deployment and
                scaling strategy.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quickstart */}
      <section id="quickstart" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2>Quickstart</h2>
            <p>Clone the monorepo, configure your stack, and run the reference chatbot in minutes.</p>
          </div>
          <div className="landing-grid landing-grid-2">
            <div className="landing-code-block">
              <pre>{`# Install & build
git clone https://github.com/kortex-ai/kortex.git
cd kortex
pnpm install
cp .env.example .env
pnpm build

# Optional local infra
docker compose up -d
pnpm db:schema

# Run demo
pnpm demo`}</pre>
            </div>
            <div className="landing-code-block">
              <pre>{`# .env — pick your stack
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

MEMORY_PROVIDER=postgres
VECTOR_PROVIDER=pgvector
DATABASE_URL=postgresql://...

EMBEDDING_DIMENSIONS=1536
EMBEDDING_PROVIDER=openai`}</pre>
            </div>
          </div>
          <p style={{ marginTop: '1.5rem' }}>
            <Link href="/getting-started" className="landing-btn landing-btn-primary">
              Full getting started guide →
            </Link>
          </p>
        </div>
      </section>

      {/* Provider matrix */}
      <section id="providers" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2>Provider matrix</h2>
            <p>
              Set AI_PROVIDER in .env to switch LLM backends. Stable, beta, and experimental adapters
              are documented with required environment variables.
            </p>
          </div>
          <div className="landing-table-wrap">
            <table className="landing-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Package</th>
                  <th>Chat</th>
                  <th>Stream</th>
                  <th>Embed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.aiProvider}>
                    <td>
                      <code>{p.aiProvider}</code>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                        {p.name}
                      </div>
                    </td>
                    <td>
                      <code>{p.package}</code>
                    </td>
                    <td className={p.chat ? 'landing-yes' : 'landing-no'}>
                      {capability(p.chat)}
                    </td>
                    <td className={p.streaming ? 'landing-yes' : 'landing-no'}>
                      {capability(p.streaming)}
                    </td>
                    <td className={p.embeddings ? 'landing-yes' : 'landing-no'}>
                      {capability(p.embeddings)}
                    </td>
                    <td>
                      <span className="landing-status" style={{ color: statusColor(p.status) }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            OpenClaw and Hermes are experimental HTTP-compatible adapters.{' '}
            <Link href="/providers" style={{ color: 'var(--accent-bright)' }}>
              Full provider docs →
            </Link>
          </p>
        </div>
      </section>

      {/* Why Kortex */}
      <section id="why" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2>Why Kortex</h2>
            <p>
              Production AI apps fail on integration surface area — not prompt quality alone.
              Kortex gives you one runtime instead of a pile of incompatible SDKs.
            </p>
          </div>
          <div className="landing-why-grid">
            {whyKortex.map((item) => (
              <div key={item.title} className="landing-why-item">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2>Roadmap</h2>
            <p>What ships today and what is planned before a stable 1.0 release.</p>
          </div>
          <div className="landing-roadmap">
            {roadmap.map((item) => (
              <div key={item.label} className="landing-roadmap-item">
                <span
                  className={item.done ? 'landing-roadmap-check' : 'landing-roadmap-pending'}
                  aria-hidden
                >
                  {item.done ? '✓' : '○'}
                </span>
                <span style={{ color: item.done ? 'var(--text-muted)' : 'var(--text-dim)' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <p>
            Kortex · MIT License ·{' '}
            <Link href="/getting-started">Documentation</Link>
            {' · '}
            <a href="https://github.com/kortex-ai/kortex" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
