import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ChatEventsPage() {
  return (
    <DocPage title="Events & callbacks">
      <SecurityNote />
      <p>Hook analytics, logging, or custom UI when users interact with the widget.</p>

      <Code>{`import { Kortex } from "@kortex/ui";

<Kortex
  apiEndpoint="/api/kortex/chat"
  onOpen={() => analytics.track("kortex_opened")}
  onClose={() => analytics.track("kortex_closed")}
  onMessage={(message) => {
    // message.role — "user" | "assistant"
    // message.content — text
    // message.timestamp — optional ISO string
    console.log(message.role, message.content);
  }}
  onResponse={(response) => {
    // response.content, response.model, response.context
    console.log("Assistant replied:", response.content);
  }}
  onError={(error) => {
    console.error("Chat failed:", error.message);
  }}
/>`}</Code>

      <h2>Callback summary</h2>
      <ul>
        <li>
          <code>onOpen</code> / <code>onClose</code> — panel visibility (widget variant)
        </li>
        <li>
          <code>onMessage</code> — every user or assistant message appended to the thread
        </li>
        <li>
          <code>onResponse</code> — completed assistant response from your backend
        </li>
        <li>
          <code>onError</code> — network or API errors from <code>apiEndpoint</code>
        </li>
      </ul>

      <p className="docs-muted">
        Imperative methods like <code>widget.open()</code> are not part of the React API in alpha.
        Control visibility with <code>variant="inline"</code> or toggle via your own UI wrapping{' '}
        <code>Kortex</code>.
      </p>

      <p>
        <Link href="/packages/chat/props">Props reference</Link>
      </p>
    </DocPage>
  );
}
