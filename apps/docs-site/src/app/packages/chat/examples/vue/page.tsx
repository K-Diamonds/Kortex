import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ChatVueExamplePage() {
  return (
    <DocPage title="Vue">
      <SecurityNote />
      <p>
        Use the Web Component — there is no <code>@kortex/vue</code> package. Register once in your
        app entry.
      </p>

      <Code>{`// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { registerKortexElement } from "@kortex/ui/element";

registerKortexElement("kortex-ui");

createApp(App).mount("#app");`}</Code>

      <Code>{`<!-- App.vue -->
<script setup lang="ts">
// kortex-ui is registered globally
</script>

<template>
  <RouterView />
  <kortex-ui
    api-endpoint="/api/kortex/chat"
    title="Kortex"
    theme="dark"
    variant="widget"
    position="bottom-right"
    welcome-message="Neural link established."
  />
</template>`}</Code>

      <p>
        <Link href="/packages/chat/web-component">Web Component docs</Link> ·{' '}
        <Link href="/packages/chat/examples/svelte">Svelte / Astro</Link>
      </p>
    </DocPage>
  );
}
