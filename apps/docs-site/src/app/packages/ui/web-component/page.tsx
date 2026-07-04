import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';
import { PropTable } from '@/components/PropTable';
import { WEB_COMPONENT_ATTRS } from '@/data/chat-props';

export default function ChatWebComponentPage() {
  return (
    <DocPage title="Web Component">
      <SecurityNote />
      <p>
        For Vue, Svelte, Angular, Astro, or plain HTML — register <code>&lt;kortex-ui&gt;</code> once,
        then use it in templates. There is no <code>@kortex/vue</code> wrapper package.
      </p>

      <h2>Register the element</h2>
      <Code>{`import { registerKortexElement } from "@kortex/ui/element";

registerKortexElement("kortex-ui");`}</Code>

      <h2>Use in HTML or templates</h2>
      <Code>{`<kortex-ui
  api-endpoint="/api/kortex/chat"
  title="Kortex"
  subtitle="Neural link active"
  theme="dark"
  variant="widget"
  position="bottom-right"
  welcome-message="Neural link established."
  memory
  rag
  class="my-chat"
  style="width: 400px; height: 520px; font-family: 'Exo 2', sans-serif"
></kortex-ui>`}</Code>

      <h2>Vue 3 example</h2>
      <Code>{`<script setup>
import { onMounted } from "vue";
import { registerKortexElement } from "@kortex/ui/element";

onMounted(() => {
  registerKortexElement("kortex-ui");
});
</script>

<template>
  <kortex-ui
    api-endpoint="/api/kortex/chat"
    title="Kortex"
    theme="dark"
  />
</template>`}</Code>

      <h2>Attribute reference</h2>
      <p>Boolean props use HTML attributes — presence means <code>true</code>.</p>
      <PropTable rows={WEB_COMPONENT_ATTRS} />

      <p>
        Full prop list: <Link href="/packages/ui/props">Props reference</Link>
      </p>
    </DocPage>
  );
}
