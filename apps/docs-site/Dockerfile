# Build from monorepo root: docker build -f apps/docs-site/Dockerfile .
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/docs-site/package.json ./apps/docs-site/
RUN pnpm install --frozen-lockfile
COPY apps/docs-site ./apps/docs-site
RUN pnpm --filter @kortex/ui build
RUN pnpm --filter @kortex/docs-site build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
COPY --from=builder /app/apps/docs-site/.next/standalone ./
COPY --from=builder /app/apps/docs-site/.next/static ./apps/docs-site/.next/static
COPY --from=builder /app/apps/docs-site/public ./apps/docs-site/public
EXPOSE 3001
CMD ["node", "apps/docs-site/server.js"]
