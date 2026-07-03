import type { KortexProps } from './types.js';

export type KortexTheme = 'light' | 'dark';

export function resolveTheme(theme: KortexProps['theme'] = 'dark'): KortexTheme {
  if (theme === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme === 'light' ? 'light' : 'dark';
}

export function themeTokens(resolved: KortexTheme) {
  if (resolved === 'light') {
    return {
      bg: '#ffffff',
      panel: '#f4f4f5',
      border: '#e4e4e7',
      text: '#18181b',
      muted: '#71717a',
      accent: '#7c3aed',
      accentText: '#ffffff',
      userBubble: '#ede9fe',
      assistantBubble: '#f4f4f5',
    };
  }
  return {
    bg: '#09090b',
    panel: '#111113',
    border: '#27272a',
    text: '#fafafa',
    muted: '#a1a1aa',
    accent: '#8b5cf6',
    accentText: '#ffffff',
    userBubble: '#3b0764',
    assistantBubble: '#18181b',
  };
}

export function roundedValue(rounded: KortexProps['rounded'] = 'lg'): string {
  switch (rounded) {
    case 'none':
      return '0';
    case 'sm':
      return '6px';
    case 'md':
      return '10px';
    case 'lg':
      return '14px';
    case 'xl':
      return '20px';
    case 'full':
      return '9999px';
    default:
      return '14px';
  }
}

export function positionStyles(position: KortexProps['position'] = 'bottom-right') {
  return position === 'bottom-left'
    ? { left: '20px', right: 'auto' }
    : { right: '20px', left: 'auto' };
}
