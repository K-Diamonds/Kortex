import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function UiPackagePage() {
  return (
      <DocPage title="@kortex/ui">
        <SecurityNote />

        <p>
          <code>@kortex/ui</code> is the web chat UI package. It exports the React component{' '}
          <code>Kortex</code> and a Web Component entry for non-React web frameworks. See also{' '}
          <Link href="/packages/chat">Chat UI packages</Link>.
        </p>

        <h2>Install</h2>
        <Code>{`pnpm add @kortex/ui react react-dom`}</Code>

        <h2>Exports</h2>
        <Code>{`export { Kortex } from "@kortex/ui";
export type { KortexProps, KortexResponse, KortexRequestBody } from "@kortex/ui";

// Deprecated aliases (temporary):
// KortexChatResponse, KortexChatRequestBody`}</Code>

        <h2>React / Next.js</h2>
        <p>
          Import and render <code>&lt;Kortex /&gt;</code>. In Next.js App Router, use a client
          component (the package ships with <code>&apos;use client&apos;</code>).
        </p>
        <Code>{`import { Kortex } from "@kortex/ui";

<Kortex
  apiEndpoint="/api/kortex/chat"
  title="Ask AI"
  theme="dark"
  variant="widget"
  memory
  rag
  tools
  stream
/>`}</Code>

        <h2>Customize appearance</h2>
        <p>
          Pass <code>className</code> or <code>style</code> to customize the chat panel — colors,
          width, height, fonts, borders, etc. These apply only to the chat UI, not your backend.
        </p>
        <Code>{`import { Kortex } from "@kortex/ui";

<Kortex
  apiEndpoint="/api/kortex/chat"
  className="my-kortex-chat"
  style={{
    width: 420,
    height: 560,
    fontFamily: "Georgia, serif",
    background: "rgba(10,10,30,0.98)",
    border: "1px solid #6366f1",
  }}
/>`}</Code>

        <h2>Vue / Svelte / Angular / Astro / HTML</h2>
        <p>
          There are no <code>@kortex/vue</code>, <code>@kortex/svelte</code>, or other framework
          wrapper packages. Do <strong>not</strong> use <code>&lt;Kortex /&gt;</code> directly in
          those frameworks unless you build your own React wrapper.
        </p>
        <p>
          Instead, register the Web Component once and use <code>&lt;kortex-ui&gt;</code> in templates
          or HTML:
        </p>
        <Code>{`import { registerKortexElement } from "@kortex/ui/element";

registerKortexElement("kortex-ui");

<kortex-ui
  class="my-kortex-chat"
  style="width: 420px; height: 560px; font-family: Georgia, serif"
  api-endpoint="/api/kortex/chat"
  title="Ask AI"
  theme="dark"
  memory
  rag
></kortex-ui>`}</Code>

        <p>
          See the full integration guide: <Link href="/packages/chat">Chat widget docs</Link> (
          <Link href="/packages/chat/quickstart">Quick Start</Link>,{' '}
          <Link href="/packages/chat/props">Props</Link>,{' '}
          <Link href="/packages/chat/examples/react">Examples</Link>). Backend:{' '}
          <Link href="/backend-route">Backend route setup</Link>.
        </p>
      </DocPage>
  );
}
