# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-slim AS builder

# Build tools for bcrypt native compilation (Debian)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Accept DATABASE_URL as build arg (Coolify passes it automatically)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copy deps + prisma config before install
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig*.json ./

# Install all deps, skip postinstall to control generate step
RUN npm install --ignore-scripts

# Generate Prisma client (DATABASE_URL is available from ARG above)
RUN ./node_modules/.bin/prisma generate

COPY . .
RUN npm run build

RUN npm prune --omit=dev

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-slim AS production

RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/prisma ./prisma
COPY --from=builder --chown=app:app /app/prisma.config.ts ./prisma.config.ts

USER app

EXPOSE 1488

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main"]
