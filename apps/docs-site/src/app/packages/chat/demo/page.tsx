import Link from 'next/link';
import { DocPage } from '@/components/Docs';
import { DiamondIcon } from '@/components/DiamondIcon';

const tryAsking = [
  'How do I install @kortex/ui on my site?',
  'What props does Kortex accept?',
  'How do I use the Web Component in Vue?',
  'Can I customize colors with className or style?',
];

export default function ChatDemoPage() {
  return (
    <DocPage title="Live demo">
      <p>
        The diamond widget in the <strong>bottom-right corner</strong> of this site is a live{' '}
        <code>@kortex/ui</code> instance wired to <code>POST /api/kortex/chat</code>. Open it and ask
        about integration.
      </p>

      <div className="docs-demo-callout">
        <DiamondIcon size={32} />
        <div>
          <p className="docs-demo-callout-title">Try asking:</p>
          <ul>
            {tryAsking.map((q) => (
              <li key={q}>
                <span>›</span> {q}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p>
        This site uses the same component as your app would — see{' '}
        <Link href="/packages/chat/quickstart">Quick Start</Link> to add it to yours.
      </p>

      <p>
        <Link href="/packages/chat/examples/react">React example</Link> ·{' '}
        <Link href="/packages/chat/install">Installation</Link>
      </p>
    </DocPage>
  );
}
