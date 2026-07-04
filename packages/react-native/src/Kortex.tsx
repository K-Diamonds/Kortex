import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { KortexMessage, KortexProps } from './types.js';
import { createWidgetStyles } from './widget-styles.js';

interface StreamEvent {
  type: string;
  content?: string;
  error?: string;
  context?: string[];
  model?: string;
}

function createSessionIds(userId?: string, sessionId?: string) {
  const uid = userId ?? `user_${Date.now()}`;
  const sid = sessionId ?? `session_${Date.now()}`;
  return { userId: uid, sessionId: sid };
}

async function sendMessage(options: {
  apiEndpoint: string;
  message: string;
  userId: string;
  sessionId: string;
  agentId?: string;
  memory?: boolean;
  rag?: boolean;
  tools?: boolean;
  stream?: boolean;
  metadata?: Record<string, unknown>;
  onChunk?: (content: string) => void;
}): Promise<{ content: string; model?: string }> {
  const response = await fetch(options.apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: options.message,
      userId: options.userId,
      sessionId: options.sessionId,
      agentId: options.agentId,
      memory: options.memory,
      rag: options.rag,
      tools: options.tools,
      stream: options.stream ?? true,
      metadata: options.metadata,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (options.stream !== false && contentType.includes('text/event-stream') && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';
    let model: string | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const event = JSON.parse(line.slice(6)) as StreamEvent;
        if (event.type === 'chunk' && event.content) {
          content += event.content;
          options.onChunk?.(event.content);
        }
        if (event.type === 'error') throw new Error(event.error ?? 'Stream error');
        if (event.model) model = event.model;
      }
    }

    return { content, model };
  }

  return (await response.json()) as { content: string; model?: string };
}

export function Kortex({
  apiEndpoint,
  title = 'Kortex',
  subtitle,
  welcomeMessage = 'Welcome to Kortex. Ask me anything.',
  placeholder = 'Interface with Kortex...',
  theme = 'dark',
  userId: userIdProp,
  sessionId: sessionIdProp,
  agentId,
  memory = false,
  rag = false,
  tools = false,
  stream = true,
  showTyping = true,
  metadata,
  onMessage,
  onResponse,
  onError,
  style: styleProp,
}: KortexProps) {
  const { userId, sessionId } = useMemo(
    () => createSessionIds(userIdProp, sessionIdProp),
    [userIdProp, sessionIdProp],
  );
  const [messages, setMessages] = useState<KortexMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const assistantIndex = useRef<number | null>(null);

  const isDark = theme !== 'light';
  const styles = useMemo(() => createWidgetStyles(isDark), [isDark]);
  const statusLine = subtitle ?? 'Neural link active';

  const submit = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: KortexMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    onMessage?.(userMessage);
    setInput('');
    setLoading(true);
    setMessages((prev) => {
      assistantIndex.current = prev.length + 1;
      return [...prev, { role: 'assistant', content: showTyping ? '' : '' }];
    });

    try {
      const response = await sendMessage({
        apiEndpoint,
        message: text,
        userId,
        sessionId,
        agentId,
        memory,
        rag,
        tools,
        stream,
        metadata,
        onChunk: (chunk) => {
          setMessages((prev) => {
            const copy = [...prev];
            const index = assistantIndex.current ?? copy.length - 1;
            const current = copy[index];
            if (!current) return copy;
            copy[index] = {
              ...current,
              content: (current.content === '' ? '' : current.content) + chunk,
            };
            return copy;
          });
        },
      });

      setMessages((prev) => {
        const copy = [...prev];
        const index = assistantIndex.current ?? copy.length - 1;
        if (copy[index]) copy[index] = { role: 'assistant', content: response.content };
        return copy;
      });
      onResponse?.({ content: response.content, model: response.model });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setMessages((prev) => prev.slice(0, -1));
      onError?.(err);
    } finally {
      setLoading(false);
      assistantIndex.current = null;
    }
  }, [
    input,
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
    showTyping,
    onMessage,
    onResponse,
    onError,
  ]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, styleProp]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.diamond} />
          <View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{statusLine}</Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => String(index)}
        ListEmptyComponent={<Text style={styles.welcome}>{welcomeMessage}</Text>}
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.role === 'user' && styles.messageRowUser]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.role === 'user' ? 'U' : '◆'}</Text>
            </View>
            <View
              style={[
                styles.bubble,
                item.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={styles.bubbleText}>
                {item.content || (loading && item.role === 'assistant' ? '…' : item.content)}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <View style={styles.composer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={placeholder}
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(12,26,36,0.35)'}
            editable={!loading}
          />
          <Pressable
            style={styles.sendButton}
            onPress={() => void submit()}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#00d4ff" size="small" />
            ) : (
              <Text style={styles.sendLabel}>→</Text>
            )}
          </Pressable>
        </View>
        <Text style={styles.footer}>
          Powered by <Text style={styles.footerBrand}>Kortex</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
