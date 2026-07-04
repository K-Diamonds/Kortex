import type { KortexProps } from './types.js';

export type KortexTheme = 'light' | 'dark';

export function resolveTheme(theme: KortexProps['theme'] = 'dark'): KortexTheme {
  if (theme === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme === 'light' ? 'light' : 'dark';
}

/** Cyber Chat Widget design tokens (from Kortex docs design). */
export function themeTokens(resolved: KortexTheme) {
  if (resolved === 'light') {
    return {
      bg: '#f0f9ff',
      panel: 'rgba(240,249,255,0.98)',
      panelBorder: 'rgba(0,150,200,0.25)',
      panelGlow: '0 0 40px rgba(0,180,220,0.08)',
      headerBg: 'linear-gradient(135deg, rgba(0,180,220,0.12) 0%, rgba(230,245,255,0.9) 100%)',
      border: 'rgba(0,150,200,0.2)',
      text: '#0c1a24',
      muted: 'rgba(12,26,36,0.55)',
      accent: '#0099cc',
      accentText: '#ffffff',
      userBubble: 'rgba(0,180,220,0.12)',
      userBubbleBorder: 'rgba(0,150,200,0.25)',
      assistantBubble: 'rgba(255,255,255,0.95)',
      assistantBubbleBorder: 'rgba(0,150,200,0.12)',
      inputBg: 'rgba(0,180,220,0.06)',
      inputBorder: 'rgba(0,150,200,0.2)',
      status: '#10b981',
      brand: '#0099cc',
      footer: 'rgba(12,26,36,0.35)',
    };
  }

  return {
    bg: '#020c18',
    panel: 'rgba(2,12,24,0.96)',
    panelBorder: 'rgba(0,212,255,0.2)',
    panelGlow:
      '0 0 60px rgba(0,212,255,0.12), 0 0 120px rgba(0,212,255,0.05), inset 0 0 40px rgba(0,212,255,0.03)',
    headerBg: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,20,40,0.6) 100%)',
    border: 'rgba(0,212,255,0.15)',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.55)',
    accent: '#00d4ff',
    accentText: '#020c18',
    userBubble: 'rgba(0,212,255,0.12)',
    userBubbleBorder: 'rgba(0,212,255,0.2)',
    assistantBubble: 'rgba(4,21,38,0.9)',
    assistantBubbleBorder: 'rgba(0,212,255,0.08)',
    inputBg: 'rgba(0,212,255,0.04)',
    inputBorder: 'rgba(0,212,255,0.15)',
    status: '#34d399',
    brand: '#00d4ff',
    footer: 'rgba(255,255,255,0.35)',
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
      return '16px';
    case 'xl':
      return '20px';
    case 'full':
      return '9999px';
    default:
      return '16px';
  }
}

export function positionStyles(position: KortexProps['position'] = 'bottom-right') {
  return position === 'bottom-left'
    ? { left: '24px', right: 'auto' }
    : { right: '24px', left: 'auto' };
}
