/**
 * Database Connection
 *
 * Prisma client singleton for database access.
 * Only available server-side.
 */

import { building } from '$app/environment';

// Type for the db proxy during build
type DbProxy = {
	$connect: () => Promise<void>;
	$disconnect: () => Promise<void>;
	$queryRaw: <T>() => Promise<T[]>;
	$executeRaw: () => Promise<number>;
	[key: string]: unknown;
};

// Create a no-op proxy for build time
function createBuildProxy(): DbProxy {
	return new Proxy({} as DbProxy, {
		get(target, prop) {
			if (prop === '$connect' || prop === '$disconnect') {
				return () => Promise.resolve();
			}
			if (prop === '$queryRaw') {
				return () => Promise.resolve([]);
			}
			if (prop === '$executeRaw') {
				return () => Promise.resolve(0);
			}
			// Return a proxy for model access that returns empty results
			return new Proxy(
				{},
				{
					get() {
						return (...args: unknown[]) => {
							// Support method chaining
							if (args.length === 0) {
								return Promise.resolve(null);
							}
							return Promise.resolve(null);
						};
					}
				}
			);
		}
	});
}

// Lazy-load prisma client only when not building
let _db: DbProxy | null = null;

function getDb(): DbProxy {
	if (_db) return _db;

	if (building) {
		_db = createBuildProxy();
		return _db;
	}

	// Dynamic import to avoid issues when @prisma/client isn't generated
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { PrismaClient } = require('@prisma/client');
		_db = new PrismaClient({
			log: ['query', 'error', 'warn']
		});
	} catch {
		console.warn('Prisma client not available, using mock');
		_db = createBuildProxy();
	}

	return _db;
}

// Export as a getter to allow lazy initialization
export const db = new Proxy({} as DbProxy, {
	get(target, prop) {
		const client = getDb();
		const value = client[prop as keyof typeof client];
		if (typeof value === 'function') {
			return value.bind(client);
		}
		return value;
	}
});

// Helper types for common queries - these will be properly typed at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ProjectWithRelations = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProjectWithRelations(slug: string): Promise<any> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const client = db as any;
	if (!client.project) return null;

	return client.project.findUnique({
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
