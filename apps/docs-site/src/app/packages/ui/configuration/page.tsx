import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ChatConfigurationPage() {
  return (
    <DocPage title="Basic options">
      <SecurityNote />
      <p>
        Only <code>apiEndpoint</code> is required. Everything else controls layout, copy, and which
        flags your backend receives.
      </p>

      <Code>{`import { Kortex } from "@kortex/ui";

<Kortex
  apiEndpoint="/api/kortex/chat"
  title="Kortex"
  subtitle="Neural link active"
  welcomeMessage="Neural link established. How can I assist?"
  placeholder="Send a transmission..."
  theme="dark"
  variant="widget"
  position="bottom-right"
  width={360}
  height={500}
  rounded="lg"
  userId="user-123"
  sessionId="session-abc"
  memory
  rag
  tools
  stream
  showTyping
  suggestions={["Hello", "Help me integrate"]}
/>`}</Code>

      <h2>Variants</h2>
      <ul>
        <li>
          <code>widget</code> — floating diamond toggle (default). Best for docs and marketing
          sites.
        </li>
        <li>
          <code>inline</code> — embedded panel, always visible in your layout.
        </li>
        <li>
          <code>fullscreen</code> — full-viewport chat surface.
        </li>
      </ul>

      <h2>Position</h2>
      <p>
        For <code>variant="widget"</code>, anchor with <code>position="bottom-right"</code> or{' '}
        <code>"bottom-left"</code>.
      </p>

      <h2>Runtime flags</h2>
      <p>
        <code>memory</code>, <code>rag</code>, and <code>tools</code> are forwarded to your backend
        in the JSON body. Your route decides how to handle them.
      </p>

      <p>
        <Link href="/packages/ui/props">Full props reference</Link> ·{' '}
        <Link href="/packages/ui/theming">Theming</Link>
      </p>
    </DocPage>
  );
}
