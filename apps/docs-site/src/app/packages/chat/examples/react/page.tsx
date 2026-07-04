import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ChatReactExamplePage() {
  return (
    <DocPage title="React / Next.js">
      <SecurityNote />

      <h2>Next.js App Router</h2>
      <Code>{`// app/components/SiteChat.tsx
"use client";

import { Kortex } from "@kortex/ui";

export function SiteChat() {
  return (
    <Kortex
      apiEndpoint="/api/kortex/chat"
      title="Kortex"
      theme="dark"
      variant="widget"
      position="bottom-right"
      memory
      stream
    />
  );
}

// app/layout.tsx
import { SiteChat } from "./components/SiteChat";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SiteChat />
      </body>
    </html>
  );
}`}</Code>

      <h2>Create React App / Vite</h2>
      <Code>{`import { Kortex } from "@kortex/ui";

export function App() {
  return (
    <>
      <YourApp />
      <Kortex
        apiEndpoint="https://mydomain.com/api/kortex/chat"
        title="Support"
        theme="dark"
        variant="widget"
      />
    </>
  );
}`}</Code>

      <p>
        <Link href="/backend-route">Backend route</Link> ·{' '}
        <Link href="/packages/chat/quickstart">Quick Start</Link>
      </p>
    </DocPage>
  );
}
