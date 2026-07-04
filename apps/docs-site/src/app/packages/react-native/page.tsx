import Link from 'next/link';
import { Code, DocPage, SecurityNote } from '@/components/Docs';

export default function ReactNativePackagePage() {
  return (
      <DocPage title="@kortex/react-native">
        <SecurityNote />

        <p>
          <code>@kortex/react-native</code> is the native chat UI package. It exports{' '}
          <code>Kortex</code> with the same public props as <code>@kortex/ui</code> where possible.
          See also <Link href="/packages/chat">Chat UI packages</Link>.
        </p>

        <h2>Install</h2>
        <Code>{`pnpm add @kortex/react-native react react-native`}</Code>

        <h2>Exports</h2>
        <Code>{`export { Kortex } from "@kortex/react-native";
export type { KortexProps, KortexResponse } from "@kortex/react-native";

// Deprecated alias (temporary): KortexChatResponse`}</Code>

        <h2>Usage</h2>
        <Code>{`import { Kortex } from "@kortex/react-native";

<Kortex
  apiEndpoint="https://mydomain.com/api/kortex/chat"
  title="Ask AI"
  theme="dark"
  memory
  rag
  stream
/>`}</Code>

        <p>
          Point <code>apiEndpoint</code> at your backend route. Secrets stay server-side — see{' '}
          <Link href="/backend-route">Backend route setup</Link>.
        </p>
      </DocPage>
  );
}
