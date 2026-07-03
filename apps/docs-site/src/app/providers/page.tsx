import { Code, DocPage, DocsNav } from '@/components/Docs';

const providers = [
  { name: 'openai', pkg: '@kortex/openai', env: 'OPENAI_API_KEY' },
  { name: 'anthropic', pkg: '@kortex/anthropic', env: 'ANTHROPIC_API_KEY' },
  { name: 'gemini', pkg: '@kortex/gemini', env: 'GEMINI_API_KEY' },
  { name: 'openrouter', pkg: '@kortex/openrouter', env: 'OPENROUTER_API_KEY' },
  { name: 'ollama', pkg: '@kortex/ollama', env: 'OLLAMA_BASE_URL' },
  { name: 'lmstudio', pkg: '@kortex/lmstudio', env: 'LMSTUDIO_BASE_URL' },
  { name: 'openclaw', pkg: '@kortex/openclaw', env: 'OPENCLAW_BASE_URL' },
  { name: 'hermes', pkg: '@kortex/hermes', env: 'HERMES_BASE_URL' },
];

export default function ProvidersPage() {
  return (
    <>
      <DocsNav />
      <DocPage title="AI Providers">
        <p>Set <code>AI_PROVIDER</code> in <code>.env</code> to switch providers without code changes.</p>
        <Code>AI_PROVIDER=openai | anthropic | gemini | openrouter | ollama | lmstudio | openclaw | hermes</Code>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #3f3f46', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Provider</th>
              <th style={{ padding: '0.5rem' }}>Package</th>
              <th style={{ padding: '0.5rem' }}>Credentials</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.name} style={{ borderBottom: '1px solid #27272a' }}>
                <td style={{ padding: '0.5rem' }}>
                  <code>{p.name}</code>
                </td>
                <td style={{ padding: '0.5rem' }}>{p.pkg}</td>
                <td style={{ padding: '0.5rem' }}>
                  <code>{p.env}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: '1.5rem' }}>
          Local HTTP providers (Ollama, LM Studio, OpenClaw, Hermes) use configurable{' '}
          <code>baseUrl</code> and OpenAI-compatible endpoints where applicable.
        </p>
      </DocPage>
    </>
  );
}
