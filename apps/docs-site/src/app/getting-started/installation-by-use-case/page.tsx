import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

const useCases = [
  {
    title: 'Chat UI only',
    desc: 'Embed the widget. Your app already has a backend route (or you will add one separately).',
    install: 'pnpm add @kortex/ui react react-dom',
    next: '/packages/ui/quickstart',
  },
  {
    title: 'Backend runtime',
    desc: 'Server-side KortexRuntime with OpenAI (or swap provider via config). No UI package required.',
    install: 'pnpm add @kortex/core @kortex/config @kortex/openai',
    next: '/backend-route',
  },
  {
    title: 'Backend + Postgres memory + pgvector',
    desc: 'Conversation memory and vector search for RAG. Add UI when ready.',
    install: 'pnpm add @kortex/core @kortex/config @kortex/openai @kortex/postgres @kortex/pgvector',
    next: '/memory-vector',
  },
  {
    title: 'React Native chat',
    desc: 'Native chat widget with the same public props where possible.',
    install: 'pnpm add @kortex/react-native react-native',
    next: '/packages/react-native',
  },
  {
    title: 'Full stack (recommended demo path)',
    desc: 'UI + backend bootstrap + optional memory/RAG toggles from the widget.',
    install: `pnpm add @kortex/ui @kortex/core @kortex/config @kortex/openai react react-dom`,
    next: '/getting-started/minimum-setup',
  },
];

export default function InstallationByUseCasePage() {
  return (
    <DocPage title="Installation by use case">
      <SecurityNote />
      <p>
        Pick the install line that matches what you are building. You can add packages later — start
        small with <Link href="/getting-started/minimum-setup">minimum setup</Link> if unsure.
      </p>

      {useCases.map((item) => (
        <div key={item.title} className="docs-use-case">
          <h2>{item.title}</h2>
          <p>{item.desc}</p>
          <Code>{item.install}</Code>
          <p>
            <Link href={item.next}>Next steps →</Link>
          </p>
        </div>
      ))}

      <h2>Monorepo development</h2>
      <Code>{`git clone https://github.com/KOfferman/Kortex.git
cd Kortex
pnpm install
cp .env.example .env
pnpm build
pnpm docs    # → http://localhost:3001`}</Code>
    </DocPage>
  );
}
