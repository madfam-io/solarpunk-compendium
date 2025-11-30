/**
 * Solstice CMS - Single Author Admin API
 *
 * GET /api/admin/authors/[id] - Get author details
 * PATCH /api/admin/authors/[id] - Update author
 * DELETE /api/admin/authors/[id] - Delete author
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin';
import { z } from 'zod';

// Update author schema
const updateAuthorSchema = z.object({
	name: z.string().min(2).max(200).optional(),
	bio: z.string().max(2000).optional().nullable(),
	avatar: z.string().url().optional().nullable(),
	website: z.string().url().optional().nullable(),
	location: z.string().max(200).optional().nullable(),
	social: z.object({
		twitter: z.string().optional(),
		mastodon: z.string().optional(),
		instagram: z.string().optional(),
		linkedin: z.string().optional()
	}).optional().nullable()
});

/**
 * GET /api/admin/authors/[id]
 * Get full author details
 */
export const GET: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	const author = await db.author.findUnique({
		where: { id },
		include: {
			user: {
				select: { id: true, email: true, name: true }
			},
			_count: {
				select: { articles: true, posts: true }
			}
		}
	});

	if (!author) {
		throw error(404, 'Author not found');
	}

	return json({ data: author });
};

/**
 * PATCH /api/admin/authors/[id]
 * Update author (admin only)
 */
export const PATCH: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	try {
		// Check if author exists
		const existing = await db.author.findUnique({ where: { id } });
		if (!existing) {
			throw error(404, 'Author not found');
		}

		const body = await event.request.json();
		const data = updateAuthorSchema.parse(body);

		// Build update data
		const updateData: Record<string, unknown> = {};

		if (data.name !== undefined) updateData.name = data.name;
		if (data.bio !== undefined) updateData.bio = data.bio;
		if (data.avatar !== undefined) updateData.avatar = data.avatar;
		if (data.website !== undefined) updateData.website = data.website;
		if (data.location !== undefined) updateData.location = data.location;
		if (data.social !== undefined) {
			// Filter out empty values
			const social: Record<string, string> = {};
			if (data.social?.twitter) social.twitter = data.social.twitter;
			if (data.social?.mastodon) social.mastodon = data.social.mastodon;
			if (data.social?.instagram) social.instagram = data.social.instagram;
			if (data.social?.linkedin) social.linkedin = data.social.linkedin;
			updateData.social = Object.keys(social).length > 0 ? social : null;
		}

		const author = await db.author.update({
			where: { id },
			data: updateData,
			include: {
				user: {
					select: { id: true, email: true, name: true }
				}
			}
		});

		return json({ data: author });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, `Invalid author data: ${err.errors.map((e) => e.message).join(', ')}`);
		}
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error updating author:', err);
		throw error(500, 'Failed to update author');
	}
};

/**
 * DELETE /api/admin/authors/[id]
 * Delete author (admin only)
 */
export const DELETE: RequestHandler = async (event) => {
	requireAdmin(event);

	const { id } = event.params;

	try {
		// Check if author exists and has content
		const existing = await db.author.findUnique({
			where: { id },
			include: {
				_count: { select: { articles: true, posts: true } }
			}
		});

		if (!existing) {
			throw error(404, 'Author not found');
		}

		// Prevent deletion if author has content
		if (existing._count.articles > 0 || existing._count.posts > 0) {
			throw error(400, 'Cannot delete author with existing content. Remove content first or reassign to another author.');
		}

		await db.author.delete({ where: { id } });

		return json({ success: true });
	} catch (err) {
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('Error deleting author:', err);
		throw error(500, 'Failed to delete author');
	}
};
