import Link from 'next/link';
import { DocPage } from '@/components/Docs';

export default function SecurityPage() {
  return (
    <DocPage title="Security">
      <p>
        Kortex enforces a strict boundary between frontend UI and backend runtime. Secrets and
        provider credentials must never reach the browser or mobile bundle.
      </p>

      <h2>Frontend never receives secrets</h2>
      <p>
        <code>&lt;Kortex /&gt;</code> (React/Next.js and React Native) and{' '}
        <code>&lt;kortex-ui&gt;</code> (Web Component) accept only:
      </p>
      <ul>
        <li>
          <code>apiEndpoint</code>
        </li>
        <li>UI props (title, theme, variant, etc.)</li>
        <li>Runtime flags (memory, rag, tools, stream)</li>
        <li>
          Optional <code>userId</code>, <code>sessionId</code>, <code>metadata</code>
        </li>
      </ul>
      <p>
        They must <strong>never</strong> receive:
      </p>
      <ul>
        <li>API keys or provider tokens</li>
        <li>Database URLs or connection strings</li>
        <li>Model provider credentials</li>
      </ul>

      <h2>Backend owns everything else</h2>
      <p>
        Your API route (via <code>@kortex/config</code>) owns:
      </p>
      <ul>
        <li>LLM provider and model selection</li>
        <li>API keys and tokens</li>
        <li>Memory provider and database connection</li>
        <li>Vector store configuration</li>
        <li>RAG ingestion and retrieval</li>
        <li>MCP clients and tool execution</li>
        <li>Agent orchestration</li>
      </ul>
      <p>
        See <Link href="/backend-route">Backend route setup</Link> for a full Next.js example.
      </p>

      <h2>Configuration and .env</h2>
      <p>
        Using <code>.env</code> on the server is <strong>highly recommended</strong> for local
        development and production secrets — but it is <strong>not required</strong>. You may load
        configuration from a secrets manager, platform environment variables, encrypted files, or
        any secure pattern you already use.
      </p>

      <h2>Recommended practices</h2>
      <ul>
        <li>
          Never import <code>@kortex/config</code>, <code>@kortex/openai</code>, or provider SDKs in
          frontend bundles
        </li>
        <li>
          Validate <code>userId</code> and <code>sessionId</code> on the server for production apps
        </li>
        <li>
          Rate-limit and authenticate your <code>apiEndpoint</code> route
        </li>
        <li>
          Use HTTPS for remote <code>apiEndpoint</code> URLs (React Native, cross-origin)
        </li>
      </ul>

      <h2>Architecture enforcement</h2>
      <p>
        <code>@kortex/ui</code> does not import backend adapter packages. Type tests and
        architecture boundary tests enforce the public UI contract in CI.
      </p>
    </DocPage>
  );
}
