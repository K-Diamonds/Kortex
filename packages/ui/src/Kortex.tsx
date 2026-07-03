'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createSessionIds, sendKortexMessage, toKortexMessage } from './client.js';
import { positionStyles, resolveTheme, roundedValue, themeTokens } from './styles.js';
import type { KortexMessage, KortexProps } from './types.js';

export function Kortex({
  apiEndpoint,
  title = 'Ask AI',
  subtitle,
  welcomeMessage = 'How can I help you today?',
  placeholder = 'Message…',
  theme = 'dark',
  variant = 'widget',
  position = 'bottom-right',
  width = 380,
  height = 520,
  rounded = 'lg',
  userId: userIdProp,
  sessionId: sessionIdProp,
  agentId,
  memory = false,
  rag = false,
  tools = false,
  stream = true,
  markdown: _markdown = true,
  citations: _citations = false,
  showSources = false,
  showModel = false,
  showTimestamp = false,
  showTyping = true,
  suggestions = [],
  metadata,
  onMessage,
  onResponse,
  onError,
  onOpen,
  onClose,
}: KortexProps) {
  const reactId = useId();
  const [open, setOpen] = useState(variant !== 'widget');
  const [messages, setMessages] = useState<KortexMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [lastModel, setLastModel] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { userId, sessionId } = useMemo(
    () => createSessionIds(userIdProp, sessionIdProp),
    [userIdProp, sessionIdProp],
  );

  const resolvedTheme = resolveTheme(theme);
  const tokens = themeTokens(resolvedTheme);
  const radius = roundedValue(rounded);
  const pos = positionStyles(position);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleOpen = useCallback(() => {
    setOpen((value) => {
      const next = !value;
      if (next) onOpen?.();
      else onClose?.();
      return next;
    });
  }, [onOpen, onClose]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMessage = toKortexMessage('user', trimmed);
      setMessages((prev) => [...prev, userMessage]);
      onMessage?.(userMessage);
      setInput('');
      setLoading(true);
      setSources([]);

      let assistantContent = '';
      setMessages((prev) => [...prev, toKortexMessage('assistant', '')]);

      try {
        const response = await sendKortexMessage({
          apiEndpoint,
          message: trimmed,
          userId,
          sessionId,
          agentId,
          memory,
          rag,
          tools,
          stream,
          metadata,
          onChunk: (chunk) => {
            assistantContent += chunk;
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last?.role === 'assistant') {
                copy[copy.length - 1] = { ...last, content: assistantContent };
              }
              return copy;
            });
          },
          onContext: (context) => {
            if (showSources) setSources(context);
          },
        });

        if (!stream) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = toKortexMessage('assistant', response.content);
            return copy;
          });
        }

        if (response.model) setLastModel(response.model);
        if (response.context && showSources) setSources(response.context);
        onResponse?.(response);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setMessages((prev) => prev.slice(0, -1));
        onError?.(err);
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      apiEndpoint,
      userId,
      sessionId,
      agentId,
      memory,
      rag,
      tools,
      stream,
      metadata,
      showSources,
      onMessage,
      onResponse,
      onError,
    ],
  );

  const panelStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    background: tokens.panel,
    border: `1px solid ${tokens.border}`,
    borderRadius: radius,
    color: tokens.text,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
    fontFamily: 'system-ui, sans-serif',
  };

  const effectivePanelStyle: React.CSSProperties =
    variant === 'fullscreen'
      ? { ...panelStyle, width: '100%', maxWidth: 720, height: '100%' }
      : panelStyle;

  const chatPanel = (
    <div style={effectivePanelStyle} data-kortex-panel>
      <header
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${tokens.border}`,
          background: tokens.bg,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 12, color: tokens.muted, marginTop: 2 }}>{subtitle}</div> : null}
        {showModel && lastModel ? (
          <div style={{ fontSize: 11, color: tokens.muted, marginTop: 4 }}>Model: {lastModel}</div>
        ) : null}
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 ? (
          <div style={{ color: tokens.muted, fontSize: 14, lineHeight: 1.6 }}>{welcomeMessage}</div>
        ) : null}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '10px 12px',
              borderRadius: radius,
              background: message.role === 'user' ? tokens.userBubble : tokens.assistantBubble,
              fontSize: 14,
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
            }}
          >
            {message.content || (loading && showTyping && index === messages.length - 1 ? '…' : '')}
            {showTimestamp && message.timestamp ? (
              <div style={{ fontSize: 10, color: tokens.muted, marginTop: 6 }}>{message.timestamp}</div>
            ) : null}
          </div>
        ))}
        {showSources && sources.length > 0 ? (
          <div style={{ fontSize: 12, color: tokens.muted }}>
            <strong>Sources</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              {sources.map((source, i) => (
                <li key={i}>{source.slice(0, 120)}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {suggestions.length > 0 && messages.length === 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px 12px' }}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void sendMessage(suggestion)}
              style={{
                border: `1px solid ${tokens.border}`,
                background: tokens.bg,
                color: tokens.text,
                borderRadius: radius,
                padding: '6px 10px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <form
        style={{ display: 'flex', gap: 8, padding: 12, borderTop: `1px solid ${tokens.border}` }}
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          disabled={loading}
          style={{
            flex: 1,
            border: `1px solid ${tokens.border}`,
            borderRadius: radius,
            padding: '10px 12px',
            background: tokens.bg,
            color: tokens.text,
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            border: 'none',
            borderRadius: radius,
            padding: '10px 14px',
            background: tokens.accent,
            color: tokens.accentText,
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );

  if (variant === 'inline') {
    return <div data-kortex-root={reactId}>{chatPanel}</div>;
  }

  if (variant === 'fullscreen') {
    return (
      <div
        data-kortex-root={reactId}
        style={{
          position: 'fixed',
          inset: 0,
          background: tokens.bg,
          zIndex: 9999,
          padding: 16,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {chatPanel}
      </div>
    );
  }

  return (
    <div data-kortex-root={reactId} style={{ position: 'fixed', bottom: 20, zIndex: 9999, ...pos }}>
      {open ? <div style={{ marginBottom: 12 }}>{chatPanel}</div> : null}
      <button
        type="button"
        aria-label={open ? 'Close Kortex' : 'Open Kortex'}
        onClick={toggleOpen}
        style={{
          marginLeft: 'auto',
          display: 'block',
          width: 56,
          height: 56,
          borderRadius: '9999px',
          border: 'none',
          background: tokens.accent,
          color: tokens.accentText,
          fontSize: 22,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 12px 24px rgba(0,0,0,0.35)',
        }}
      >
        {open ? '×' : 'K'}
      </button>
    </div>
  );
}
