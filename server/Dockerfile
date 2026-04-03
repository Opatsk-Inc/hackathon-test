# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Required for bcrypt native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# Skip postinstall (it runs prisma generate which needs DATABASE_URL at build time)
RUN npm install --ignore-scripts

# Generate Prisma client with a dummy URL (generate only reads schema, no DB connection)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

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

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
