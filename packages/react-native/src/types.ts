export interface KortexMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface KortexChatResponse {
  content: string;
  model?: string;
  context?: string[];
  tools?: string;
}

/**
 * Public UI props for `<Kortex />`.
 *
 * Security: never pass API keys, database URLs, provider secrets, tokens, or model
 * credentials to the UI. The frontend only calls `apiEndpoint`; secrets stay on
 * your backend route.
 */
export interface KortexProps {
  apiEndpoint: string;

  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  placeholder?: string;

  theme?: 'light' | 'dark' | 'system';
  variant?: 'widget' | 'inline' | 'fullscreen';
  position?: 'bottom-right' | 'bottom-left';

  width?: number | string;
  height?: number | string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  userId?: string;
  sessionId?: string;
  agentId?: string;

  memory?: boolean;
  rag?: boolean;
  tools?: boolean;
  stream?: boolean;
  markdown?: boolean;
  citations?: boolean;
  showSources?: boolean;
  showModel?: boolean;
  showTimestamp?: boolean;
  showTyping?: boolean;

  suggestions?: string[];

  metadata?: Record<string, unknown>;

  onMessage?: (message: KortexMessage) => void;
  onResponse?: (response: KortexChatResponse) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
}
