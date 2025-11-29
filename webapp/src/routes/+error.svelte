<script lang="ts">
	import { page } from '$app/stores';
	import SEO from '$lib/components/SEO.svelte';

	$: status = $page.status;
	$: message = $page.error?.message || 'Something went wrong';

	const errorMessages: Record<number, { title: string; description: string; emoji: string }> = {
		404: {
			title: 'Page Not Found',
			description: "The path you're seeking doesn't exist in our garden yet.",
			emoji: '🌱'
		},
		500: {
			title: 'Server Error',
			description: "Something went wrong on our end. We're working on it.",
			emoji: '🔧'
		},
		403: {
			title: 'Access Denied',
			description: "You don't have permission to access this resource.",
			emoji: '🚫'
		}
	};

	$: errorInfo = errorMessages[status] || {
		title: 'Error',
		description: message,
		emoji: '⚠️'
	};
</script>

<SEO
	title="{status} - {errorInfo.title}"
	description={errorInfo.description}
/>

<div class="min-h-screen flex items-center justify-center px-4 py-20">
	<div class="max-w-md mx-auto text-center">
		<div class="text-8xl mb-6">{errorInfo.emoji}</div>

		<div class="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-sm font-mono mb-4">
			{status}
		</div>

		<h1 class="font-orbitron text-3xl md:text-4xl font-bold mb-4">
			{errorInfo.title}
		</h1>

		<p class="text-slate-400 mb-8 text-lg">
			{errorInfo.description}
		</p>

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/" class="btn-primary">
				Return Home
			</a>
			<button
				on:click={() => history.back()}
				class="btn-secondary"
			>
				Go Back
			</button>
		</div>

		{#if status === 404}
			<div class="mt-12 pt-8 border-t border-slate-800">
				<p class="text-sm text-slate-500 mb-4">Looking for something specific?</p>
				<div class="flex flex-wrap gap-3 justify-center">
					<a href="/editions" class="text-solarpunk-teal hover:underline text-sm">
						Editions
					</a>
					<span class="text-slate-700">|</span>
					<a href="/directory" class="text-solarpunk-teal hover:underline text-sm">
						Directory
					</a>
					<span class="text-slate-700">|</span>
					<a href="/tools" class="text-solarpunk-teal hover:underline text-sm">
						Tools
					</a>
					<span class="text-slate-700">|</span>
					<a href="/community" class="text-solarpunk-teal hover:underline text-sm">
						Community
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>
