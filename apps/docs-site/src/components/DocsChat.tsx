'use client';

import { Kortex } from '@kortex/ui';

export function DocsChat() {
  return (
    <Kortex
      apiEndpoint="/api/kortex/chat"
      title="Kortex"
      subtitle="Docs assistant"
      theme="dark"
      variant="widget"
      position="bottom-right"
      stream={false}
      welcomeMessage="Welcome to Kortex docs. Ask about packages, backend setup, or security."
      suggestions={[
        'How do I set up a backend route?',
        'What props does Kortex accept?',
        'How do I use the Web Component?',
      ]}
    />
  );
}
