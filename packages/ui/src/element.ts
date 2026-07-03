import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Kortex } from './Kortex.js';
import type { KortexProps } from './types.js';

function readBooleanAttribute(element: HTMLElement, name: string): boolean | undefined {
  if (!element.hasAttribute(name)) return undefined;
  const value = element.getAttribute(name);
  if (value === null || value === 'true' || value === '') return true;
  if (value === 'false') return false;
  return true;
}

function attrsToProps(element: HTMLElement): KortexProps {
  const apiEndpoint = element.getAttribute('api-endpoint');
  if (!apiEndpoint) {
    throw new Error('<kortex-ui> requires api-endpoint attribute');
  }

  return {
    apiEndpoint,
    title: element.getAttribute('title') ?? undefined,
    subtitle: element.getAttribute('subtitle') ?? undefined,
    welcomeMessage: element.getAttribute('welcome-message') ?? undefined,
    placeholder: element.getAttribute('placeholder') ?? undefined,
    theme: (element.getAttribute('theme') as KortexProps['theme']) ?? undefined,
    variant: (element.getAttribute('variant') as KortexProps['variant']) ?? undefined,
    position: (element.getAttribute('position') as KortexProps['position']) ?? undefined,
    width: element.getAttribute('width') ?? undefined,
    height: element.getAttribute('height') ?? undefined,
    rounded: (element.getAttribute('rounded') as KortexProps['rounded']) ?? undefined,
    userId: element.getAttribute('user-id') ?? undefined,
    sessionId: element.getAttribute('session-id') ?? undefined,
    agentId: element.getAttribute('agent-id') ?? undefined,
    memory: readBooleanAttribute(element, 'memory'),
    rag: readBooleanAttribute(element, 'rag'),
    tools: readBooleanAttribute(element, 'tools'),
    stream: readBooleanAttribute(element, 'stream'),
    markdown: readBooleanAttribute(element, 'markdown'),
    citations: readBooleanAttribute(element, 'citations'),
    showSources: readBooleanAttribute(element, 'show-sources'),
    showModel: readBooleanAttribute(element, 'show-model'),
    showTimestamp: readBooleanAttribute(element, 'show-timestamp'),
    showTyping: readBooleanAttribute(element, 'show-typing'),
  };
}

class KortexUiElement extends HTMLElement {
  private root: Root | null = null;

  connectedCallback(): void {
    const mountPoint = document.createElement('div');
    this.appendChild(mountPoint);
    this.root = createRoot(mountPoint);
    this.render();
  }

  disconnectedCallback(): void {
    this.root?.unmount();
    this.root = null;
  }

  private render(): void {
    if (!this.root) return;
    this.root.render(createElement(Kortex, attrsToProps(this)));
  }
}

export function registerKortexElement(tagName = 'kortex-ui'): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, KortexUiElement);
  }
}

export { KortexUiElement };
