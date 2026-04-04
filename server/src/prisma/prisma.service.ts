import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const connectionString = PrismaService.buildDatabaseUrl();
        const adapter = new PrismaPg({ connectionString });
        super({ adapter });
    }

    private static buildDatabaseUrl(): string {
        if (process.env.DATABASE_URL) {
            return process.env.DATABASE_URL;
        }

        const user = encodeURIComponent(process.env.POSTGRES_USER || 'postgres');
        const password = encodeURIComponent(process.env.POSTGRES_PASSWORD || '');
        const host = process.env.POSTGRES_HOST || 'localhost';
        const port = process.env.POSTGRES_PORT || '5432';
        const db = encodeURIComponent(process.env.POSTGRES_DB || 'postgres');

        return `postgresql://${user}:${password}@${host}:${port}/${db}`;
    }

    async onModuleInit() {
        await this.$connect();
    }
}
