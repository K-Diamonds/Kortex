import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { KortexMessage, KortexProps } from './types.js';

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
  title = 'Ask AI',
  subtitle,
  welcomeMessage = 'How can I help you today?',
  placeholder = 'Message…',
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
  const styles = useMemo(() => createStyles(isDark), [isDark]);

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
      return [...prev, { role: 'assistant', content: showTyping ? '…' : '' }];
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
              content: (current.content === '…' ? '' : current.content) + chunk,
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => String(index)}
        ListEmptyComponent={<Text style={styles.welcome}>{welcomeMessage}</Text>}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
          editable={!loading}
        />
        <Pressable style={styles.sendButton} onPress={() => void submit()} disabled={loading || !input.trim()}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendLabel}>Send</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(dark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#09090b' : '#ffffff' },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#27272a' : '#e4e4e7',
    },
    title: { color: dark ? '#fafafa' : '#18181b', fontSize: 18, fontWeight: '600' },
    subtitle: { color: dark ? '#a1a1aa' : '#71717a', fontSize: 13, marginTop: 2 },
    list: { padding: 16, gap: 10 },
    welcome: { color: dark ? '#a1a1aa' : '#71717a', fontSize: 15, lineHeight: 22 },
    bubble: {
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
      maxWidth: '85%',
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: dark ? '#3b0764' : '#ede9fe',
    },
    assistantBubble: {
      alignSelf: 'flex-start',
      backgroundColor: dark ? '#18181b' : '#f4f4f5',
    },
    bubbleText: { color: dark ? '#fafafa' : '#18181b', fontSize: 15, lineHeight: 21 },
    composer: {
      flexDirection: 'row',
      gap: 8,
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: dark ? '#27272a' : '#e4e4e7',
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: dark ? '#27272a' : '#e4e4e7',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: dark ? '#fafafa' : '#18181b',
      backgroundColor: dark ? '#111113' : '#ffffff',
    },
    sendButton: {
      backgroundColor: '#8b5cf6',
      borderRadius: 12,
      paddingHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendLabel: { color: '#ffffff', fontWeight: '600' },
  });
}
