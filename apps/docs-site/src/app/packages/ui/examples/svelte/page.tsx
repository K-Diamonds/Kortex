import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ChatSvelteExamplePage() {
  return (
    <DocPage title="Svelte / Astro">
      <SecurityNote />
      <p>Register the custom element once, then use it in any template.</p>

      <h2>Svelte</h2>
      <Code>{`<!-- +layout.svelte -->
<script>
  import { onMount } from "svelte";
  import { registerKortexElement } from "@kortex/ui/element";

  onMount(() => registerKortexElement("kortex-ui"));
</script>

<slot />

<kortex-ui
  api-endpoint="/api/kortex/chat"
  title="Kortex"
  theme="dark"
/>`}</Code>

      <h2>Astro</h2>
      <Code>{`---
// ChatWidget.astro — use client:only or a small client island
---
<kortex-ui api-endpoint="/api/kortex/chat" title="Kortex" theme="dark" />

<script>
  import { registerKortexElement } from "@kortex/ui/element";
  registerKortexElement("kortex-ui");
</script>`}</Code>

      <p>
        <Link href="/packages/ui/web-component">Web Component</Link> ·{' '}
        <Link href="/packages/ui/examples/vue">Vue example</Link>
      </p>
    </DocPage>
  );
}
