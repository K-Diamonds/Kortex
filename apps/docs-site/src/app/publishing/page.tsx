import { Code, DocPage } from '@/components/Docs';

export default function PublishingPage() {
  return (
    <DocPage title="Publishing packages">
      <p>
        Kortex is currently in alpha (<code>0.1.0-alpha</code>). Packages are developed in this
        monorepo under <code>packages/</code>. The docs site lives at <code>apps/docs-site</code>{' '}
        and is deployed separately (Vercel, Netlify, etc.) — no second repository required.
      </p>

      <h2>Pre-publish checklist</h2>
      <p>
        Run every step from the repo root before publishing any <code>@kortex/*</code> package:
      </p>
      <Code>{`pnpm install
pnpm build
pnpm test
pnpm lint`}</Code>

      <h2>Verify package exports</h2>
      <p>For each package you publish, confirm:</p>
      <ul>
        <li>
          <code>package.json</code> — correct <code>name</code>, <code>version</code>, and{' '}
          <code>exports</code>
        </li>
        <li>
          <code>pnpm --filter @kortex/core build</code> (or target package) produces{' '}
          <code>dist/</code>
        </li>
        <li>
          <code>dist/index.d.ts</code> exports the documented public API
        </li>
        <li>
          <code>files</code> includes only <code>dist</code> (not source)
        </li>
        <li>
          Peer dependencies declared where needed (<code>react</code> for UI packages)
        </li>
      </ul>

      <h2>Publish to npm</h2>
      <Code>{`npm login

# Publish one package
pnpm --filter @kortex/core publish --access public --no-git-checks

# Or publish all public packages (when ready)
pnpm -r publish --access public --no-git-checks`}</Code>

      <h2>Primary publish targets</h2>
      <ul>
        <li>
          <code>@kortex/core</code>
        </li>
        <li>
          <code>@kortex/config</code>
        </li>
        <li>
          <code>@kortex/ui</code>
        </li>
        <li>
          <code>@kortex/react-native</code>
        </li>
        <li>
          Provider adapters (<code>@kortex/openai</code>, etc.) as they reach stable status
        </li>
      </ul>

      <h2>Docs site deployment (Vercel)</h2>
      <p>
        Set <strong>Root Directory</strong> to <code>apps/docs-site</code> in the Vercel project
        settings. <code>vercel.json</code> in that folder runs monorepo install/build from the repo
        root.
      </p>
      <Code>{`# Local build
pnpm --filter @kortex/docs-site build

# Vercel (see apps/docs-site/vercel.json)
# Root Directory: apps/docs-site
# GitHub deploy job: deploy-vercel in .github/workflows/ci.yml`}</Code>

      <h2>Versioning</h2>
      <p>
        Stay on <code>0.1.0-alpha</code> until APIs stabilize. Bump to <code>1.0.0</code> only after
        production readiness review.
      </p>
    </DocPage>
  );
}
