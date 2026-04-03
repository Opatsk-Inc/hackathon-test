# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY --chown=node:node . .

# Install deps, skip postinstall (it runs prisma generate which needs DB URL)
RUN npm ci --ignore-scripts

# Generate Prisma client from schema.prisma (prisma.config.ts excluded via .dockerignore)
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Remove dev dependencies
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
