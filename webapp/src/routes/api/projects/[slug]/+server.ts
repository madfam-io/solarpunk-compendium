/**
 * Single Project API
 *
 * GET /api/projects/[slug] - Get project by slug
 * PUT /api/projects/[slug] - Update project (owner/admin only)
 * DELETE /api/projects/[slug] - Delete project (owner/admin only)
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { z } from 'zod';

// Update project schema
const updateProjectSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	tagline: z.string().min(10).max(200).optional(),
	description: z.string().min(50).max(5000).optional(),
	website: z.string().url().optional().nullable(),
	location: z.string().max(100).optional().nullable(),
	coordinates: z
		.object({
			lat: z.number().min(-90).max(90),
			lng: z.number().min(-180).max(180)
		})
		.optional()
		.nullable(),
	logo: z.string().url().optional().nullable(),
	coverImage: z.string().url().optional().nullable(),
	categoryIds: z.array(z.string()).min(1).max(5).optional(),
	sdgIds: z.array(z.number().min(1).max(17)).min(1).max(17).optional(),
	tags: z.array(z.string().max(30)).max(10).optional()
});

/**
 * GET /api/projects/[slug]
 * Get a single project by slug
 */
export const GET: RequestHandler = async ({ params }) => {
	const project = await db.project.findUnique({
		where: { slug: params.slug },
		include: {
			categories: { include: { category: true } },
			sdgs: { include: { sdg: true } },
			tags: { include: { tag: true } },
			submittedBy: {
				select: { id: true, name: true, avatar: true }
			}
		}
	});

	if (!project) {
		throw error(404, 'Project not found');
	}

	// Only return published projects to non-owners
	if (project.status !== 'PUBLISHED') {
		// In a real app, check if user is owner or admin
		throw error(404, 'Project not found');
	}

	return json({
		data: {
			...project,
			categories: project.categories.map((c) => c.category),
			sdgs: project.sdgs.map((s) => s.sdg),
			tags: project.tags.map((t) => t.tag.name)
		}
	});
};

/**
 * PUT /api/projects/[slug]
 * Update a project (owner or admin only)
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Authentication required');
	}

	const project = await db.project.findUnique({
		where: { slug: params.slug }
	});

	if (!project) {
		throw error(404, 'Project not found');
	}

	// Check ownership (in real app, also check admin role)
	if (project.submittedById !== locals.user.id) {
		throw error(403, 'Not authorized to update this project');
	}

	try {
		const body = await request.json();
		const data = updateProjectSchema.parse(body);

		// Build update data
		const updateData: any = {};

		if (data.name) updateData.name = data.name;
		if (data.tagline) updateData.tagline = data.tagline;
		if (data.description) updateData.description = data.description;
		if (data.website !== undefined) updateData.website = data.website;
		if (data.location !== undefined) updateData.location = data.location;
		if (data.coordinates !== undefined) updateData.coordinates = data.coordinates;
		if (data.logo !== undefined) updateData.logo = data.logo;
		if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;

		// Update project
		const updated = await db.project.update({
			where: { slug: params.slug },
			data: updateData,
			include: {
				categories: { include: { category: true } },
				sdgs: { include: { sdg: true } },
				tags: { include: { tag: true } }
			}
		});

		// Update categories if provided
		if (data.categoryIds) {
			await db.projectCategory.deleteMany({ where: { projectId: project.id } });
			await db.projectCategory.createMany({
				data: data.categoryIds.map((categoryId) => ({
					projectId: project.id,
					categoryId
				}))
			});
		}

		// Update SDGs if provided
		if (data.sdgIds) {
			await db.projectSDG.deleteMany({ where: { projectId: project.id } });
			await db.projectSDG.createMany({
				data: data.sdgIds.map((sdgId) => ({
					projectId: project.id,
					sdgId
				}))
			});
		}

		return json({ data: updated });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, { message: 'Invalid update data', errors: err.errors });
		}
		console.error('Error updating project:', err);
		throw error(500, 'Failed to update project');
	}
};

/**
 * DELETE /api/projects/[slug]
 * Delete a project (owner or admin only)
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Authentication required');
	}

	const project = await db.project.findUnique({
		where: { slug: params.slug }
	});

	if (!project) {
		throw error(404, 'Project not found');
	}

	// Check ownership (in real app, also check admin role)
	if (project.submittedById !== locals.user.id) {
		throw error(403, 'Not authorized to delete this project');
	}

	await db.project.delete({
		where: { slug: params.slug }
	});

	return new Response(null, { status: 204 });
};
