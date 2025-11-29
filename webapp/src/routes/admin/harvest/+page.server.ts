/**
 * Admin Harvest Queue - Server Data Loading
 */

import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getQueueStats } from '$lib/server/harvest';

export const load: PageServerLoad = async ({ url }) => {
	// TODO: Add admin auth check

	const status = url.searchParams.get('status') || 'PENDING';
	const sourceId = url.searchParams.get('source') || '';
	const page = parseInt(url.searchParams.get('page') || '1');

	const where: Record<string, unknown> = {};
	if (status && status !== 'ALL') {
		where.status = status;
	}
	if (sourceId) {
		where.sourceId = sourceId;
	}

	const [items, total, sources, stats] = await Promise.all([
		db.harvestItem.findMany({
			where,
			include: {
				source: {
					select: { id: true, name: true, slug: true }
				}
			},
			orderBy: [{ quality: 'desc' }, { createdAt: 'desc' }],
			skip: (page - 1) * 20,
			take: 20
		}),
		db.harvestItem.count({ where }),
		db.harvestSource.findMany({
			orderBy: { name: 'asc' },
			select: { id: true, name: true, slug: true }
		}),
		getQueueStats()
	]);

	return {
		items: items.map((item) => ({
			...item,
			rawData: undefined, // Don't send raw data to client
			normalized: item.normalized as Record<string, unknown>
		})),
		pagination: {
			page,
			total,
			totalPages: Math.ceil(total / 20)
		},
		sources,
		stats,
		filters: {
			status,
			sourceId
		}
	};
};
