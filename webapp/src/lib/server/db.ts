/**
 * Database Connection
 *
 * Prisma client singleton for database access.
 * Only available server-side.
 */

import { PrismaClient } from '@prisma/client';
import { building } from '$app/environment';

// Prevent multiple instances in development due to hot reloading
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const db =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: building ? [] : ['query', 'error', 'warn']
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = db;
}

// Helper types for common queries
export type ProjectWithRelations = Awaited<ReturnType<typeof getProjectWithRelations>>;

async function getProjectWithRelations(slug: string) {
	return db.project.findUnique({
		where: { slug },
		include: {
			categories: { include: { category: true } },
			sdgs: { include: { sdg: true } },
			tags: { include: { tag: true } },
			submittedBy: {
				select: { id: true, name: true, avatar: true }
			}
		}
	});
}

export { getProjectWithRelations };
