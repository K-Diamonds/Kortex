import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';
import { PropTable } from '@/components/PropTable';
import { KORTEX_PROPS } from '@/data/chat-props';

export default function ChatPropsPage() {
  return (
    <DocPage title="Props reference">
      <SecurityNote />
      <p>
        Public props for <code>&lt;Kortex /&gt;</code> from <code>@kortex/ui</code>. Types are exported
        as <code>KortexProps</code>, <code>KortexMessage</code>, and <code>KortexResponse</code>.
      </p>

      <Code>{`import type { KortexProps, KortexResponse, KortexRequestBody } from "@kortex/ui";`}</Code>

      <PropTable rows={KORTEX_PROPS} />

      <h2>Request body (POST apiEndpoint)</h2>
      <p>Your backend receives JSON shaped like:</p>
      <Code>{`{
  "message": "Hello",
  "userId": "…",
  "sessionId": "…",
  "agentId": "optional",
  "memory": false,
  "rag": false,
  "tools": false,
  "stream": true,
  "metadata": {}
}`}</Code>

      <p>
        <Link href="/backend-route">Backend route setup</Link> ·{' '}
        <Link href="/packages/ui/web-component">Web Component attributes</Link>
      </p>
    </DocPage>
  );
}
