# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Prune dev dependencies
RUN npm prune --omit=dev

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/prisma ./prisma

USER app

EXPOSE 1488

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
