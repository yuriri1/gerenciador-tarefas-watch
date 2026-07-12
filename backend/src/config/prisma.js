import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const globalForPrisma = globalThis;

const pool =
	globalForPrisma.pgPool ??
	new Pool({
		connectionString: process.env.DATABASE_URL,
	});

if (!globalForPrisma.pgPool) {
	globalForPrisma.pgPool = pool;
}

const adapter =
	globalForPrisma.prismaAdapter ??
	new PrismaPg(pool);

if (!globalForPrisma.prismaAdapter) {
	globalForPrisma.prismaAdapter = adapter;
}

const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
	});

if (!globalForPrisma.prisma) {
	globalForPrisma.prisma = prisma;
}

export default prisma;
export { prisma };