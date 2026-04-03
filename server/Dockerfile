# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Required for bcrypt native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# Skip postinstall (prisma generate runs separately below)
RUN npm install --ignore-scripts

# Use local prisma binary directly (no npx download)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma

COPY . .
RUN npm run build

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

CMD ["sh", "-c", "./node_modules/.bin/prisma generate --schema=prisma/schema.prisma && ./node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma && node dist/main"]
