/**
 * Solstice CMS - Single Submission Admin API
 *
 * GET /api/admin/submissions/[id] - Get submission details
 * PATCH /api/admin/submissions/[id] - Update submission
 * POST /api/admin/submissions/[id]/convert - Convert to article
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import { z } from 'zod';

// Update submission schema
const updateSubmissionSchema = z.object({
	status: z.enum(['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']).optional(),
	reviewNotes: z.string().max(1000).optional().nullable()
});

/**
 * GET /api/admin/submissions/[id]
 * Get full submission details
 */
export const GET: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	const submission = await db.editionSubmission.findUnique({
		where: { id },
		include: {
			edition: {
				select: { id: true, slug: true, title: true, season: true, year: true, status: true }
			},
			submitter: {
				select: { id: true, name: true, email: true, avatar: true, bio: true }
			}
		}
	});

	if (!submission) {
		throw error(404, 'Submission not found');
	}

	return json({ data: submission });
};

/**
 * PATCH /api/admin/submissions/[id]
 * Update submission status
 */
export const PATCH: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	try {
		const existing = await db.editionSubmission.findUnique({ where: { id } });
		if (!existing) {
			throw error(404, 'Submission not found');
		}

		if (existing.status === 'PUBLISHED') {
			throw error(400, 'Cannot modify a published submission');
		}

		const body = await event.request.json();
		const data = updateSubmissionSchema.parse(body);

		const submission = await db.editionSubmission.update({
			where: { id },
			data: {
				...data,
				reviewedAt: new Date()
			},
			include: {
				edition: {
					select: { id: true, slug: true, title: true, season: true, year: true }
				},
				submitter: {
					select: { id: true, name: true, email: true }
				}
			}
		});

		return json({ data: submission });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error updating submission:', err);
		throw error(500, 'Failed to update submission');
	}
};

/**
 * POST /api/admin/submissions/[id]
 * Convert accepted submission to article
 */
export const POST: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;
	const url = new URL(event.request.url);
	const action = url.searchParams.get('action');

	if (action !== 'convert') {
		throw error(400, 'Invalid action. Use ?action=convert');
	}

	try {
		const submission = await db.editionSubmission.findUnique({
			where: { id },
			include: {
				edition: true,
				submitter: true
			}
		});

		if (!submission) {
			throw error(404, 'Submission not found');
		}

		if (submission.status !== 'ACCEPTED') {
			throw error(400, 'Only accepted submissions can be converted to articles');
		}

		if (submission.articleId) {
			throw error(400, 'Submission has already been converted to an article');
		}

		// Check if submitter has an author profile, create one if not
		let author = await db.author.findUnique({
			where: { userId: submission.submitterId }
		});

		if (!author && submission.submitter) {
			// Create author profile from user
			const baseSlug = (submission.submitter.name || submission.submitter.email.split('@')[0])
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');

			let slug = baseSlug;
			let counter = 1;
			while (await db.author.findUnique({ where: { slug } })) {
				slug = `${baseSlug}-${counter}`;
				counter++;
			}

			author = await db.author.create({
				data: {
					slug,
					name: submission.submitter.name || submission.submitter.email.split('@')[0],
					userId: submission.submitterId,
					avatar: submission.submitter.avatar,
					bio: submission.submitter.bio
				}
			});
		}

		// Generate article slug
		const baseSlug = submission.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		let slug = baseSlug;
		let counter = 1;
		while (await db.article.findUnique({ where: { slug } })) {
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		// Get next order
		const lastArticle = await db.article.findFirst({
			where: { editionId: submission.editionId },
			orderBy: { order: 'desc' }
		});
		const order = (lastArticle?.order ?? -1) + 1;

		// Calculate reading time
		const content = submission.draft || submission.outline || submission.pitch;
		const wordCount = content.split(/\s+/).length;
		const readTime = Math.max(1, Math.ceil(wordCount / 200));

		// Create article from submission
		const article = await db.article.create({
			data: {
				slug,
				title: submission.title,
				excerpt: submission.pitch,
				content: submission.draft || `# ${submission.title}\n\n${submission.outline || submission.pitch}`,
				editionId: submission.editionId,
				authorId: author?.id,
				order,
				readTime,
				status: 'SEED'
			},
			include: {
				edition: {
					select: { id: true, slug: true, title: true, season: true, year: true }
				},
				author: {
					select: { id: true, name: true, slug: true }
				}
			}
		});

		// Update submission with article reference
		await db.editionSubmission.update({
			where: { id },
			data: {
				status: 'PUBLISHED',
				articleId: article.id
			}
		});

		return json({
			success: true,
			article
		}, { status: 201 });
	} catch (err) {
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error converting submission:', err);
		throw error(500, 'Failed to convert submission to article');
	}
};
