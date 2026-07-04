import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ChatThemingPage() {
  return (
    <DocPage title="Theming">
      <SecurityNote />
      <p>
        Use built-in <code>theme</code> for light/dark presets, or override the panel with{' '}
        <code>className</code> and <code>style</code>.
      </p>

      <h2>Built-in themes</h2>
      <Code>{`<Kortex
  apiEndpoint="/api/kortex/chat"
  theme="dark"
  // theme="light" | "dark" | "system"
/>`}</Code>

      <h2>Inline styles</h2>
      <p>
        Styles apply to the chat panel root (<code>data-kortex-panel</code>), not the diamond
        toggle.
      </p>
      <Code>{`<Kortex
  apiEndpoint="/api/kortex/chat"
  style={{
    width: 420,
    height: 560,
    fontFamily: "'Exo 2', sans-serif",
    background: "rgba(2, 12, 24, 0.96)",
    border: "1px solid rgba(0, 212, 255, 0.2)",
    boxShadow: "0 0 60px rgba(0, 212, 255, 0.12)",
  }}
/>`}</Code>

      <h2>CSS class</h2>
      <Code>{`.my-kortex-chat {
  width: 420px;
  height: 560px;
  font-family: "Exo 2", sans-serif;
  background: rgba(2, 12, 24, 0.96);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

<Kortex apiEndpoint="/api/kortex/chat" className="my-kortex-chat" />`}</Code>

      <h2>Web Component</h2>
      <Code>{`<kortex-ui
  api-endpoint="/api/kortex/chat"
  class="my-kortex-chat"
  style="width: 420px; height: 560px; border: 1px solid #00d4ff"
></kortex-ui>`}</Code>

      <h2>Size & shape</h2>
      <Code>{`<Kortex
  apiEndpoint="/api/kortex/chat"
  width={400}
  height={520}
  rounded="xl"
/>`}</Code>

      <p>
        <Link href="/packages/ui/props">Props reference</Link> ·{' '}
        <Link href="/packages/ui/web-component">Web Component</Link>
      </p>
    </DocPage>
  );
}
