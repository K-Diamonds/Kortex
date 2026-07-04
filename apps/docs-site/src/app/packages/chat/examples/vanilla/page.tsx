import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ChatVanillaExamplePage() {
  return (
    <DocPage title="Vanilla JS / HTML">
      <SecurityNote />
      <p>
        Bundle <code>@kortex/ui/element</code> with your build tool, or load from your app&apos;s JS
        bundle. CDN is not published in alpha.
      </p>

      <Code>{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My site with Kortex</title>
</head>
<body>
  <h1>Welcome</h1>

  <kortex-ui
    api-endpoint="/api/kortex/chat"
    title="Kortex"
    theme="dark"
    variant="widget"
    position="bottom-right"
    welcome-message="Neural link established. How can I assist?"
  ></kortex-ui>

  <script type="module">
    import { registerKortexElement } from "@kortex/ui/element";
    registerKortexElement("kortex-ui");
  </script>
</body>
</html>`}</Code>

      <h2>Svelte / Astro</h2>
      <p>Same pattern — register in a client script, then use <code>&lt;kortex-ui&gt;</code> in markup.</p>
      <Code>{`---
// ChatWidget.astro (client:load a wrapper that calls registerKortexElement)
---
<kortex-ui api-endpoint="/api/kortex/chat" title="Kortex" theme="dark" />`}</Code>

      <p>
        <Link href="/packages/chat/web-component">Web Component</Link> ·{' '}
        <Link href="/backend-route">Backend route</Link>
      </p>
    </DocPage>
  );
}
