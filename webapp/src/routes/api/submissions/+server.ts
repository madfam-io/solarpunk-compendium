/**
 * Public Submissions API
 *
 * POST /api/submissions - Submit article pitch (auth required)
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { z } from 'zod';

// Create submission schema
const createSubmissionSchema = z.object({
	editionId: z.string().min(1),
	title: z.string().min(5).max(300),
	pitch: z.string().min(100).max(5000),
	outline: z.string().max(10000).optional().nullable()
});

/**
 * POST /api/submissions
 * Submit article pitch for edition consideration
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Please sign in to submit');
	}

	try {
		const body = await request.json();
		const data = createSubmissionSchema.parse(body);

		// Verify edition exists and is accepting submissions
		const edition = await db.edition.findUnique({
			where: { id: data.editionId }
		});

		if (!edition) {
			throw error(404, 'Edition not found');
		}

		if (edition.status !== 'ACCEPTING') {
			throw error(400, 'This edition is not currently accepting submissions');
		}

		// Check if call has closed
		if (edition.callCloseAt && new Date(edition.callCloseAt) < new Date()) {
			throw error(400, 'The submission deadline for this edition has passed');
		}

		// Check for duplicate submission
		const existing = await db.editionSubmission.findFirst({
			where: {
				editionId: data.editionId,
				submitterId: locals.user.id,
				title: data.title
			}
		});

		if (existing) {
			throw error(409, 'You have already submitted a pitch with this title');
		}

		// Create submission
		const submission = await db.editionSubmission.create({
			data: {
				editionId: data.editionId,
				submitterId: locals.user.id,
				title: data.title,
				pitch: data.pitch,
				outline: data.outline,
				status: 'PENDING'
			},
			include: {
				edition: {
					select: { title: true, season: true, year: true }
				}
			}
		});

		return json({
			success: true,
			data: {
				id: submission.id,
				title: submission.title,
				edition: submission.edition
			}
		}, { status: 201 });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid submission: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error creating submission:', err);
		throw error(500, 'Failed to create submission');
	}
};

/**
 * GET /api/submissions
 * Get user's own submissions (auth required)
 */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Authentication required');
	}

	const submissions = await db.editionSubmission.findMany({
		where: {
			submitterId: locals.user.id
		},
		include: {
			edition: {
				select: { id: true, slug: true, title: true, season: true, year: true }
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	return json({ data: submissions });
};
