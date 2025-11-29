/**
 * Newsletter Subscribers API
 *
 * POST /api/subscribers - Subscribe to newsletter
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { z } from 'zod';

const subscribeSchema = z.object({
	email: z.string().email(),
	name: z.string().max(100).optional(),
	source: z.string().max(50).optional()
});

/**
 * POST /api/subscribers
 * Subscribe to the newsletter
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const data = subscribeSchema.parse(body);

		// Check if already subscribed
		const existing = await db.subscriber.findUnique({
			where: { email: data.email }
		});

		if (existing) {
			if (existing.unsubscribed) {
				// Re-subscribe
				await db.subscriber.update({
					where: { email: data.email },
					data: { unsubscribed: false, subscribedAt: new Date() }
				});
				return json({ message: 'Welcome back! You have been re-subscribed.' });
			}
			return json({ message: 'You are already subscribed!' });
		}

		// Create new subscriber
		await db.subscriber.create({
			data: {
				email: data.email,
				name: data.name,
				source: data.source || 'website'
			}
		});

		// TODO: Send welcome email via Resend
		// await sendWelcomeEmail(data.email, data.name);

		return json({ message: 'Thanks for subscribing! Check your inbox for a welcome email.' }, { status: 201 });
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw error(400, { message: 'Invalid email address' });
		}
		console.error('Error subscribing:', err);
		throw error(500, 'Failed to subscribe');
	}
};
