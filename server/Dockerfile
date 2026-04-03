# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-slim AS builder

# Build tools for bcrypt native compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dummy DATABASE_URL for build time — prisma generate reads schema only, never connects
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

COPY package*.json ./
COPY prisma ./prisma
# Note: prisma.config.ts is intentionally NOT copied so prisma uses schema.prisma directly

# npm install triggers postinstall → prisma generate (uses dummy URL above)
RUN npm install

COPY . .
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-slim AS production

RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

# Copy all node_modules (includes prisma devDep needed for migrate in CMD)
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/prisma ./prisma

USER app

EXPOSE 1488

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main"]
