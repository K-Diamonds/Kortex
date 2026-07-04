'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createSessionIds, sendKortexMessage, toKortexMessage } from './client.js';
import { DiamondIcon, DiamondToggleButton, SendIcon, UserIcon } from './DiamondIcon.js';
import { positionStyles, resolveTheme, roundedValue, themeTokens } from './styles.js';
import type { KortexMessage, KortexProps } from './types.js';

export function Kortex({
  apiEndpoint,
  title = 'Kortex',
  subtitle,
  welcomeMessage = 'Welcome to Kortex. Ask me anything.',
  placeholder = 'Interface with Kortex...',
  theme = 'dark',
  variant = 'widget',
  position = 'bottom-right',
  width = 360,
  height = 500,
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
  className,
  style: styleProp,
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
  const statusLine = subtitle ?? 'Neural link active';

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

  const panelWidth = typeof width === 'number' ? `${width}px` : width;
  const panelHeight = typeof height === 'number' ? `${height}px` : height;

  const chatPanel = (
    <div
      data-kortex-panel
      className={className}
      style={{
        width: panelWidth,
        height: panelHeight,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: radius,
        background: tokens.panel,
        border: `1px solid ${tokens.panelBorder}`,
        boxShadow: tokens.panelGlow,
        backdropFilter: 'blur(20px)',
        fontFamily: 'Inter, system-ui, sans-serif',
        ...styleProp,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: `1px solid ${tokens.border}`,
          background: tokens.headerBg,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DiamondIcon size={28} />
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: tokens.brand,
                textTransform: 'uppercase',
              }}
            >
              {title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: tokens.status,
                  boxShadow: `0 0 6px ${tokens.status}`,
                }}
              />
              <span style={{ fontSize: 10, color: tokens.muted }}>{statusLine}</span>
            </div>
            {showModel && lastModel ? (
              <div style={{ fontSize: 10, color: tokens.muted, marginTop: 2 }}>
                Model: {lastModel}
              </div>
            ) : null}
          </div>
        </div>
        {variant === 'widget' ? (
          <button
            type="button"
            aria-label="Close Kortex"
            onClick={toggleOpen}
            style={{
              width: 28,
              height: 28,
              border: 'none',
              borderRadius: 6,
              background: 'transparent',
              color: 'rgba(0,212,255,0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            ×
          </button>
        ) : null}
      </header>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              color: tokens.muted,
              fontSize: 14,
              lineHeight: 1.6,
              padding: '8px 0',
            }}
          >
            {welcomeMessage}
          </div>
        ) : null}

        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          const isEmptyAssistant =
            !isUser && !message.content && loading && showTyping && index === messages.length - 1;

          if (isEmptyAssistant) return null;

          return (
            <div
              key={`${message.role}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 8,
                flexDirection: isUser ? 'row-reverse' : 'row',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isUser ? (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,212,255,0.15)',
                      border: '1px solid rgba(0,212,255,0.3)',
                    }}
                  >
                    <UserIcon />
                  </div>
                ) : (
                  <DiamondIcon size={20} />
                )}
              </div>
              <div
                style={{
                  maxWidth: '78%',
                  padding: '10px 14px',
                  fontSize: 14,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  borderRadius: 12,
                  ...(isUser
                    ? {
                        background: tokens.userBubble,
                        border: `1px solid ${tokens.userBubbleBorder}`,
                        color: tokens.text,
                        borderBottomRightRadius: 4,
                      }
                    : {
                        background: tokens.assistantBubble,
                        border: `1px solid ${tokens.assistantBubbleBorder}`,
                        color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.85)' : tokens.text,
                        borderBottomLeftRadius: 4,
                      }),
                }}
              >
                {message.content ||
                  (loading && showTyping && index === messages.length - 1 ? '…' : '')}
                {showTimestamp && message.timestamp ? (
                  <div style={{ fontSize: 10, color: tokens.muted, marginTop: 6 }}>
                    {message.timestamp}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {loading && showTyping && messages[messages.length - 1]?.content === '' ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <DiamondIcon size={20} />
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                borderBottomLeftRadius: 4,
                background: tokens.assistantBubble,
                border: `1px solid ${tokens.assistantBubbleBorder}`,
                display: 'flex',
                gap: 4,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: tokens.brand,
                    animation: 'kortex-bounce 1s infinite',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}

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
                border: `1px solid ${tokens.inputBorder}`,
                background: tokens.inputBg,
                color: tokens.text,
                borderRadius: 8,
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

      <div style={{ padding: 12, borderTop: `1px solid ${tokens.border}`, flexShrink: 0 }}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${tokens.inputBorder}`,
              background: tokens.inputBg,
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={placeholder}
              disabled={loading}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: tokens.text,
                fontSize: 14,
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid rgba(0,212,255,0.3)',
                background: 'rgba(0,212,255,0.15)',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.35 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SendIcon />
            </button>
          </div>
        </form>
        <p style={{ textAlign: 'center', fontSize: 10, marginTop: 6, color: tokens.footer }}>
          Powered by <span style={{ color: tokens.brand }}>Kortex</span>
        </p>
      </div>

      <style>{`
        @keyframes kortex-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );

  const effectivePanel =
    variant === 'fullscreen' ? (
      <div style={{ width: '100%', maxWidth: 720, height: '100%' }}>{chatPanel}</div>
    ) : (
      chatPanel
    );

  if (variant === 'inline') {
    return <div data-kortex-root={reactId}>{effectivePanel}</div>;
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
        {effectivePanel}
      </div>
    );
  }

  return (
    <div
      data-kortex-root={reactId}
      style={{
        position: 'fixed',
        bottom: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 16,
        ...pos,
      }}
    >
      {open ? effectivePanel : null}
      <button
        type="button"
        aria-label={open ? 'Close Kortex' : 'Open Kortex'}
        onClick={toggleOpen}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          filter: open
            ? 'drop-shadow(0 0 16px rgba(0,212,255,0.9))'
            : 'drop-shadow(0 0 8px rgba(0,212,255,0.5))',
          transition: 'transform 0.2s, filter 0.2s',
        }}
      >
        <DiamondToggleButton open={open} />
      </button>
    </div>
  );
}
