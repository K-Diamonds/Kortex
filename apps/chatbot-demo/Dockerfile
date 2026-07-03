# Build from monorepo root: docker build -f apps/chatbot-demo/Dockerfile .
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/chatbot-demo/package.json ./apps/chatbot-demo/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY apps/chatbot-demo ./apps/chatbot-demo
ENV CI=true
ENV AI_PROVIDER=openai
ENV OPENAI_API_KEY=build-placeholder
ENV MEMORY_PROVIDER=none
ENV VECTOR_PROVIDER=none
RUN pnpm --filter @kortex/chatbot-demo build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

COPY --from=builder /app/apps/chatbot-demo/.next/standalone ./
COPY --from=builder /app/apps/chatbot-demo/.next/static ./apps/chatbot-demo/.next/static
COPY --from=builder /app/apps/chatbot-demo/public ./apps/chatbot-demo/public

CMD ["node", "apps/chatbot-demo/server.js"]
