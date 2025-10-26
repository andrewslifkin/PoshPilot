# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY services/worker/package.json services/worker/
RUN pnpm install --ignore-scripts

FROM deps AS builder
COPY . .
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["pnpm", "--filter", "@poshpilot/web", "start"]
