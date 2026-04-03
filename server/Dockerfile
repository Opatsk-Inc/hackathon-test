# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY --chown=node:node . .

RUN npm ci --ignore-scripts

# Override DATABASE_URL injected by Coolify (password contains # which breaks URL parsing)
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

RUN npx prisma generate

RUN npm run build

RUN npm prune --omit=dev

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/prisma ./prisma

USER node

EXPOSE 1488

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
