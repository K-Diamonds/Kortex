import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ChatInstallPage() {
  return (
    <DocPage title="Installation">
      <SecurityNote />
      <p>Install <code>@kortex/ui</code> via any Node package manager.</p>

      <h2>npm</h2>
      <Code>{`npm install @kortex/ui react react-dom`}</Code>

      <h2>yarn</h2>
      <Code>{`yarn add @kortex/ui react react-dom`}</Code>

      <h2>pnpm</h2>
      <Code>{`pnpm add @kortex/ui react react-dom`}</Code>

      <h2>Peer dependencies</h2>
      <p>
        <code>@kortex/ui</code> requires <code>react</code> and <code>react-dom</code> ≥ 18. For
        Next.js App Router, import <code>Kortex</code> in a client component (the package ships with{' '}
        <code>&apos;use client&apos;</code>).
      </p>

      <h2>React Native</h2>
      <Code>{`pnpm add @kortex/react-native react-native`}</Code>
      <p>
        See <Link href="/packages/react-native">@kortex/react-native</Link>.
      </p>

      <h2>CDN (coming soon)</h2>
      <p className="docs-muted">
        A hosted CDN bundle is not published in alpha. Use npm +{' '}
        <Link href="/packages/ui/web-component">Web Component</Link> for non-React sites, or bundle
        with Vite/webpack.
      </p>
    </DocPage>
  );
}
