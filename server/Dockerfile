# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# Install all deps (postinstall runs prisma generate automatically)
RUN npm ci

# Explicitly generate Prisma client
RUN npx prisma generate

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

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
