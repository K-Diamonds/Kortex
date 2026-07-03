'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Settings {
  aiProvider: string;
  aiModel: string;
  memoryProvider: string;
  vectorProvider: string;
  embeddingProvider: string;
  mcpEnabled: boolean;
  providers?: string[];
}

const PROVIDER_OPTIONS = [
  'openai',
  'anthropic',
  'gemini',
  'openrouter',
  'ollama',
  'lmstudio',
  'openclaw',
  'hermes',
] as const;

export function ChatApp() {
  const reactId = useId();
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [useMemory, setUseMemory] = useState(false);
  const [useRag, setUseRag] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [retrievedContext, setRetrievedContext] = useState<string[]>([]);
  const [toolOutput, setToolOutput] = useState<string | null>(null);
  const [uploadText, setUploadText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [idsReady, setIdsReady] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const uid = localStorage.getItem('kortex:userId') ?? `user_${reactId.replace(/:/g, '')}`;
    const sid = localStorage.getItem('kortex:sessionId') ?? `session_${Date.now()}`;
    setUserId(uid);
    setSessionId(sid);
    localStorage.setItem('kortex:userId', uid);
    localStorage.setItem('kortex:sessionId', sid);
    setIdsReady(true);
  }, [reactId]);

  useEffect(() => {
    void fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const s = data as Settings;
        setSettings(s);
        setSelectedProvider(s.aiProvider);
      })
      .catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const ingestText = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userId, sessionId }),
      });
      const data = (await response.json()) as { chunks?: number; error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Ingest failed');
      setUploadText('');
      setToolOutput(`Ingested ${data.chunks ?? 0} chunks`);
    },
    [userId, sessionId],
  );

  const ingestDocument = useCallback(async () => {
    await ingestText(uploadText);
  }, [ingestText, uploadText]);

  const onFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? '');
        void ingestText(text).catch((e) => setToolOutput(String(e)));
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [ingestText],
  );

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming || !userId || !sessionId) return;

    setInput('');
    setRetrievedContext([]);
    setToolOutput(null);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setStreaming(true);
    let assistantContent = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId,
          sessionId,
          useMemory,
          useRag,
          aiProvider: selectedProvider,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Request failed (${response.status})`);
      }

      if (!response.body) throw new Error('No response stream');

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          if (!event.startsWith('data: ')) continue;
          const data = JSON.parse(event.slice(6)) as {
            type: string;
            content?: string;
            error?: string;
            context?: string[];
            tools?: string;
          };

          if (data.type === 'chunk' && data.content) {
            assistantContent += data.content;
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === 'assistant') {
                next[next.length - 1] = { role: 'assistant', content: assistantContent };
              }
              return next;
            });
          } else if (data.type === 'context' && data.context) {
            setRetrievedContext(data.context);
          } else if (data.type === 'tools' && data.tools) {
            setToolOutput(data.tools);
          } else if (data.type === 'error') {
            throw new Error(data.error ?? 'Stream error');
          }
        }
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Something went wrong';
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${errMsg}` }]);
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, userId, sessionId, useMemory, useRag, selectedProvider]);

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl gap-6 px-4 py-8">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Kortex Chat</h1>
              <p className="mt-1 text-sm text-zinc-400">
                Powered by <code className="text-violet-300">createKortexFromEnv()</code>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
            >
              Settings
            </button>
          </div>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
          <label className="flex items-center gap-2">
            Provider
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200"
            >
              {(settings?.providers ?? PROVIDER_OPTIONS).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={useMemory} onChange={(e) => setUseMemory(e.target.checked)} />
            Memory
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={useRag} onChange={(e) => setUseRag(e.target.checked)} />
            RAG
          </label>
          <span className="text-zinc-500">
            {idsReady && userId && sessionId ? `${userId} · ${sessionId}` : 'Loading…'}
          </span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.length === 0 && (
            <p className="py-12 text-center text-sm text-zinc-500">
              Configure <code className="text-zinc-400">.env</code> and send a message
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user' ? 'ml-8 bg-violet-600/20' : 'mr-8 bg-zinc-800/80'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {streaming && <p className="text-sm text-zinc-500">Streaming…</p>}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex gap-2 border-t border-white/10 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage();
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message…"
            disabled={streaming}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>

      <aside className="hidden w-72 shrink-0 flex-col gap-4 lg:flex">
        {(showSettings || settings) && (
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs">
            <h2 className="mb-2 font-medium text-zinc-200">Provider</h2>
            {settings ? (
              <dl className="space-y-1 text-zinc-400">
                <div className="flex justify-between">
                  <dt>AI</dt>
                  <dd className="text-violet-300">{settings.aiProvider}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Model</dt>
                  <dd>{settings.aiModel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Memory</dt>
                  <dd>{settings.memoryProvider}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Vector</dt>
                  <dd>{settings.vectorProvider}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>MCP</dt>
                  <dd>{settings.mcpEnabled ? 'on' : 'off'}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-zinc-500">Loading settings…</p>
            )}
          </section>
        )}

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs">
          <h2 className="mb-2 font-medium text-zinc-200">RAG Upload</h2>
          <input
            type="file"
            accept=".txt,.md,.json,.csv,text/plain"
            onChange={onFileUpload}
            className="mb-2 w-full text-zinc-400"
          />
          <textarea
            value={uploadText}
            onChange={(e) => setUploadText(e.target.value)}
            placeholder="Paste document text…"
            rows={4}
            className="mb-2 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-zinc-200"
          />
          <button
            type="button"
            onClick={() => void ingestDocument().catch((e) => setToolOutput(String(e)))}
            className="w-full rounded bg-zinc-800 py-1.5 text-zinc-200"
          >
            Ingest
          </button>
          <p className="mt-2 text-zinc-500">
            Tools: send <code className="text-zinc-400">/tool get_current_time {'{}'}</code>
          </p>
        </section>

        {retrievedContext.length > 0 && (
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs">
            <h2 className="mb-2 font-medium text-zinc-200">Retrieved Context</h2>
            <ul className="max-h-40 space-y-2 overflow-y-auto text-zinc-400">
              {retrievedContext.map((chunk, i) => (
                <li key={i} className="rounded bg-zinc-950 p-2">
                  {chunk.slice(0, 200)}
                  {chunk.length > 200 ? '…' : ''}
                </li>
              ))}
            </ul>
          </section>
        )}

        {toolOutput && (
          <section className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs text-amber-200">
            <h2 className="mb-1 font-medium">Tool / Action</h2>
            <p>{toolOutput}</p>
          </section>
        )}
      </aside>
    </div>
  );
}
