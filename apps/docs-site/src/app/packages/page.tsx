import Link from 'next/link';
import { DocPage } from '@/components/Docs';

const backendPackages = [
  {
    href: '/packages/core',
    name: '@kortex/core',
    summary: 'Backend runtime — KortexRuntime, interfaces, orchestration. No env wiring or concrete providers.',
  },
  {
    href: '/packages/config',
    name: '@kortex/config',
    summary: 'Server bootstrap — createKortex(), createKortexFromEnv(), validation, adapter loading.',
  },
];

const chatPackages = [
  {
    href: '/packages/ui',
    name: '@kortex/ui',
    summary: 'Web chat widget — <Kortex /> for React/Next.js; <kortex-ui> Web Component for other web frameworks.',
  },
  {
    href: '/packages/react-native',
    name: '@kortex/react-native',
    summary: 'Native chat widget — <Kortex /> for React Native with the same public props where possible.',
  },
];

export default function PackagesPage() {
  return (
      <DocPage title="Packages">
        <p>
          Kortex&apos;s public product surface is four npm packages plus two apps in this monorepo.
          Adapters (OpenAI, Postgres, pgvector, etc.) plug into the runtime via{' '}
          <code>@kortex/config</code>.
        </p>

        <h2>Backend packages</h2>
        <ul>
          {backendPackages.map((pkg) => (
            <li key={pkg.href} style={{ marginBottom: '1rem' }}>
              <Link href={pkg.href} style={{ color: '#a78bfa' }}>
                {pkg.name}
              </Link>
              {' — '}
              {pkg.summary}
            </li>
          ))}
        </ul>

        <h2>Chat UI packages</h2>
        <p>
          Drop-in chat widgets that call your backend <code>apiEndpoint</code> only. Full integration
          guide: <Link href="/packages/ui">@kortex/ui documentation</Link> (install, config, theming,
          props, framework examples). This docs site embeds <code>@kortex/ui</code> on every page.
        </p>
        <ul>
          {chatPackages.map((pkg) => (
            <li key={pkg.href} style={{ marginBottom: '1rem' }}>
              <Link href={pkg.href} style={{ color: '#00d4ff' }}>
                {pkg.name}
              </Link>
              {' — '}
              {pkg.summary}
            </li>
          ))}
        </ul>

        <h2>Apps in this repo</h2>
        <ul>
          <li>
            <code>apps/docs-site</code> — documentation + embedded <code>@kortex/ui</code> chat
            widget (run with <code>pnpm docs</code> → <code>http://localhost:3001</code>)
          </li>
        </ul>

        <h2>Frontend by platform</h2>
        <ul>
          <li>
            <strong>React / Next.js</strong> — <code>import {'{ Kortex }'} from &quot;@kortex/ui&quot;</code>
          </li>
          <li>
            <strong>React Native</strong> —{' '}
            <code>import {'{ Kortex }'} from &quot;@kortex/react-native&quot;</code>
          </li>
          <li>
            <strong>Vue / Svelte / Angular / Astro / HTML</strong> —{' '}
            <code>registerKortexElement</code> from <code>@kortex/ui/element</code>, then{' '}
            <code>&lt;kortex-ui&gt;</code>. There are no <code>@kortex/vue</code> or{' '}
            <code>@kortex/svelte</code> wrapper packages — do not use <code>&lt;Kortex /&gt;</code>{' '}
            in those frameworks unless you wrap the React component yourself.
          </li>
        </ul>

        <h2>Security model</h2>
        <p>
          The frontend <strong>never</strong> receives API keys, database URLs, provider tokens, or
          model credentials. UI components only call <code>apiEndpoint</code> plus UI/runtime flags.
        </p>
        <p>
          Your backend route owns provider, model, tokens, database, vector store, RAG, MCP, tools,
          and agents. <code>.env</code> is highly recommended for secrets but not required — use any
          secure configuration source on the server.
        </p>
        <p>
          See <Link href="/backend-route">Backend route setup</Link> and{' '}
          <Link href="/security">Security</Link>.
        </p>

        <h2>Related docs</h2>
        <ul>
          <li>
            <Link href="/backend-route">Backend route setup</Link>
          </li>
          <li>
            <Link href="/security">Security</Link>
          </li>
          <li>
            <Link href="/publishing">Publishing packages</Link>
          </li>
        </ul>
      </DocPage>
  );
}
