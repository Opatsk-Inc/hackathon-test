import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'
import { expand } from 'dotenv-expand'

expand(dotenv.config())

function buildDatabaseUrl(): string {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL
    }

    const user = encodeURIComponent(process.env.POSTGRES_USER || 'postgres')
    const password = encodeURIComponent(process.env.POSTGRES_PASSWORD || '')
    const host = process.env.POSTGRES_HOST || 'localhost'
    const port = process.env.POSTGRES_PORT || '5432'
    const db = encodeURIComponent(process.env.POSTGRES_DB || 'postgres')

    return `postgresql://${user}:${password}@${host}:${port}/${db}`
}

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        seed: 'ts-node prisma/seed.ts',
    },
    datasource: {
        url: buildDatabaseUrl(),
    },
})
