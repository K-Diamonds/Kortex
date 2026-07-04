import type { Metadata } from 'next';
import { DocsShell } from '@/components/Docs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kortex — AI Infrastructure Runtime for TypeScript',
  description:
    'Build production-ready AI backends with multi-LLM support, memory, vector search, RAG, MCP tools, and agents.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <DocsShell>{children}</DocsShell>
      </body>
    </html>
  );
}
