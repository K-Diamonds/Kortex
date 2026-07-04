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
        <Code>AI_PROVIDER=openai | anthropic | gemini | openrouter | ollama | lmstudio | openclaw | hermes</Code>

        <h2 style={{ marginTop: '2rem' }}>Status tiers</h2>
        <ul style={{ color: '#d4d4d8' }}>
          {(Object.keys(providerStatusGuide) as Array<keyof typeof providerStatusGuide>).map((key) => (
            <li key={key} style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: statusColor(key) }}>{providerStatusGuide[key].label}</strong>
              {' — '}
              {providerStatusGuide[key].description}
            </li>
          ))}
        </ul>

        <h2 style={{ marginTop: '2rem' }}>Provider matrix</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3f3f46', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Provider</th>
                <th style={{ padding: '0.5rem' }}>Package</th>
                <th style={{ padding: '0.5rem' }}>Chat</th>
                <th style={{ padding: '0.5rem' }}>Streaming</th>
                <th style={{ padding: '0.5rem' }}>Embeddings</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem' }}>Required env variables</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.aiProvider} style={{ borderBottom: '1px solid #27272a', verticalAlign: 'top' }}>
                  <td style={{ padding: '0.5rem' }}>
                    <code>{p.aiProvider}</code>
                    <div style={{ color: '#a1a1aa', fontSize: 12, marginTop: 4 }}>{p.name}</div>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <code>{p.package}</code>
                  </td>
                  <td style={{ padding: '0.5rem' }}>{capability(p.chat)}</td>
                  <td style={{ padding: '0.5rem' }}>{capability(p.streaming)}</td>
                  <td style={{ padding: '0.5rem' }}>{capability(p.embeddings)}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{ color: statusColor(p.status), fontWeight: 600 }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
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

        <h2 style={{ marginTop: '2rem' }}>Experimental HTTP adapters</h2>
        <p style={{ color: '#d4d4d8' }}>
          <strong>OpenClaw</strong> and <strong>Hermes</strong> are experimental HTTP-compatible adapters built on{' '}
          <code>@kortex/provider-shared</code>. They target servers that expose OpenAI-style REST endpoints but are not
          tied to a specific vendor SDK. Capabilities depend entirely on what your endpoint implements — validate chat,
          streaming, and embeddings against your deployment before production use.
        </p>

        <h3 style={{ marginTop: '1.25rem', fontSize: '1rem' }}>Provider notes</h3>
        <ul style={{ color: '#d4d4d8' }}>
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
