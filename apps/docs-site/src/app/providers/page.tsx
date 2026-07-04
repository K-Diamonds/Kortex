import { Code, DocPage } from '@/components/Docs';
import { providerStatusGuide, providers, statusColor } from '@/data/providers';

function capability(value: boolean): string {
  return value ? 'Yes' : 'No';
}

export default function ProvidersPage() {
  return (
    <DocPage title="AI Providers">
      <p>
        Set <code>AI_PROVIDER</code> in <code>.env</code> to switch providers without code changes.
        Kortex is currently in alpha / developer preview — provider maturity varies by status below.
      </p>
      <Code>
        AI_PROVIDER=openai | anthropic | gemini | openrouter | ollama | lmstudio | openclaw | hermes
      </Code>

      <h2>Status tiers</h2>
      <ul>
        {(Object.keys(providerStatusGuide) as Array<keyof typeof providerStatusGuide>).map(
          (key) => (
            <li key={key} style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: statusColor(key) }}>{providerStatusGuide[key].label}</strong>
              {' — '}
              {providerStatusGuide[key].description}
            </li>
          ),
        )}
      </ul>

      <h2>Provider matrix</h2>
      <div className="docs-table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Package</th>
              <th>Chat</th>
              <th>Streaming</th>
              <th>Embeddings</th>
              <th>Status</th>
              <th>Required env variables</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.aiProvider}>
                <td>
                  <code>{p.aiProvider}</code>
                  <div className="docs-muted" style={{ fontSize: 12, marginTop: 4 }}>
                    {p.name}
                  </div>
                </td>
                <td>
                  <code>{p.package}</code>
                </td>
                <td>{capability(p.chat)}</td>
                <td>{capability(p.streaming)}</td>
                <td>{capability(p.embeddings)}</td>
                <td>
                  <span style={{ color: statusColor(p.status), fontWeight: 600 }}>{p.status}</span>
                </td>
                <td>
                  {p.envVars.map((env) => (
                    <div key={env}>
                      <code>{env}</code>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Experimental HTTP adapters</h2>
      <p>
        <strong>OpenClaw</strong> and <strong>Hermes</strong> are experimental HTTP-compatible
        adapters built on <code>@kortex/provider-shared</code>. They target servers that expose
        OpenAI-style REST endpoints but are not tied to a specific vendor SDK. Capabilities depend
        entirely on what your endpoint implements — validate chat, streaming, and embeddings against
        your deployment before production use.
      </p>

      <h3 style={{ marginTop: '1.25rem', fontSize: '1rem' }}>Provider notes</h3>
      <ul>
        {providers
          .filter((p) => p.notes)
          .map((p) => (
            <li key={p.aiProvider}>
              <strong>{p.name}</strong>: {p.notes}
            </li>
          ))}
      </ul>
    </DocPage>
  );
}
