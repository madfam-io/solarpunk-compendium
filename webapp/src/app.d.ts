// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { JanuaUser } from '$lib/janua';

declare global {
	namespace App {
		interface Locals {
			user: JanuaUser | null;
			session: { token: string } | null;
		}
		// interface Error {}
		interface PageData {
			user?: JanuaUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
