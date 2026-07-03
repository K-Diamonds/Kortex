import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kortex — AI Infrastructure Runtime for TypeScript',
  description:
    'Build production-ready AI backends with multi-LLM support, memory, vector search, RAG, MCP tools, and agents. Bring your own infrastructure.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
