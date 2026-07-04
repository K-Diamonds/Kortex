export interface ChatPropRow {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export const KORTEX_PROPS: ChatPropRow[] = [
  {
    name: 'apiEndpoint',
    type: 'string',
    description: 'Your backend chat route URL. Required. Never pass API keys here.',
  },
  {
    name: 'title',
    type: 'string',
    defaultValue: '"Kortex"',
    description: 'Header title shown in the widget.',
  },
  {
    name: 'subtitle',
    type: 'string',
    description: 'Status line under the title (e.g. “Neural link active”).',
  },
  {
    name: 'welcomeMessage',
    type: 'string',
    description: 'First assistant message when the panel opens.',
  },
  {
    name: 'placeholder',
    type: 'string',
    defaultValue: '"Interface with Kortex..."',
    description: 'Input placeholder text.',
  },
  {
    name: 'theme',
    type: '"light" | "dark" | "system"',
    defaultValue: '"dark"',
    description: 'Built-in color theme.',
  },
  {
    name: 'variant',
    type: '"widget" | "inline" | "fullscreen"',
    defaultValue: '"widget"',
    description: 'widget = floating diamond toggle; inline/fullscreen = always visible.',
  },
  {
    name: 'position',
    type: '"bottom-right" | "bottom-left"',
    defaultValue: '"bottom-right"',
    description: 'Anchor corner for variant="widget".',
  },
  {
    name: 'width',
    type: 'number | string',
    defaultValue: '360',
    description: 'Panel width in px or CSS value.',
  },
  {
    name: 'height',
    type: 'number | string',
    defaultValue: '500',
    description: 'Panel height in px or CSS value.',
  },
  {
    name: 'rounded',
    type: '"none" | "sm" | "md" | "lg" | "xl" | "full"',
    defaultValue: '"lg"',
    description: 'Border radius preset for the panel.',
  },
  {
    name: 'userId',
    type: 'string',
    description: 'Stable user id sent to your backend. Auto-generated if omitted.',
  },
  {
    name: 'sessionId',
    type: 'string',
    description: 'Conversation session id. Auto-generated if omitted.',
  },
  { name: 'agentId', type: 'string', description: 'Optional agent id for backend runAgent().' },
  {
    name: 'memory',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Ask backend to use conversation memory.',
  },
  {
    name: 'rag',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Ask backend to retrieve RAG context.',
  },
  {
    name: 'tools',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Enable tool-related backend behavior.',
  },
  {
    name: 'stream',
    type: 'boolean',
    defaultValue: 'true',
    description: 'Stream SSE chunks from apiEndpoint when supported.',
  },
  {
    name: 'markdown',
    type: 'boolean',
    defaultValue: 'true',
    description: 'Render assistant markdown (when enabled in UI).',
  },
  {
    name: 'citations',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Show citation UI for RAG sources.',
  },
  {
    name: 'showSources',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Display retrieved context snippets.',
  },
  {
    name: 'showModel',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Show model name on responses.',
  },
  {
    name: 'showTimestamp',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Show timestamps on messages.',
  },
  {
    name: 'showTyping',
    type: 'boolean',
    defaultValue: 'true',
    description: 'Show typing indicator while waiting.',
  },
  {
    name: 'suggestions',
    type: 'string[]',
    description: 'Quick-reply chips shown before first message.',
  },
  {
    name: 'metadata',
    type: 'Record<string, unknown>',
    description: 'Opaque metadata forwarded to your backend route.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'CSS class on the chat panel root (data-kortex-panel).',
  },
  {
    name: 'style',
    type: 'CSSProperties',
    description: 'Inline styles on the chat panel — colors, fonts, borders, etc.',
  },
  {
    name: 'onMessage',
    type: '(message) => void',
    description: 'Fires when a user or assistant message is added.',
  },
  {
    name: 'onResponse',
    type: '(response) => void',
    description: 'Fires when a full assistant response is received.',
  },
  {
    name: 'onError',
    type: '(error) => void',
    description: 'Fires when the apiEndpoint request fails.',
  },
  { name: 'onOpen', type: '() => void', description: 'Fires when the widget panel opens.' },
  { name: 'onClose', type: '() => void', description: 'Fires when the widget panel closes.' },
];

export const WEB_COMPONENT_ATTRS: ChatPropRow[] = [
  { name: 'api-endpoint', type: 'string', description: 'Maps to apiEndpoint. Required.' },
  { name: 'title', type: 'string', description: 'Widget title.' },
  { name: 'subtitle', type: 'string', description: 'Status subtitle.' },
  { name: 'welcome-message', type: 'string', description: 'Initial greeting.' },
  { name: 'placeholder', type: 'string', description: 'Input placeholder.' },
  { name: 'theme', type: 'string', description: 'light | dark | system' },
  { name: 'variant', type: 'string', description: 'widget | inline | fullscreen' },
  { name: 'position', type: 'string', description: 'bottom-right | bottom-left' },
  {
    name: 'memory / rag / tools / stream',
    type: 'boolean attr',
    description: 'Present attribute = true (e.g. memory or memory="true").',
  },
  {
    name: 'class + style',
    type: 'HTML',
    description: 'Standard className and inline style on <kortex-ui>.',
  },
];
