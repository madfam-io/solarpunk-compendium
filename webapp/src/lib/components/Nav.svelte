<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from './ThemeToggle.svelte';
	import SeasonIndicator from './SeasonIndicator.svelte';

	let mobileMenuOpen = false;

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/directory', label: 'Directory' },
		{ href: '/editions', label: 'Editions' },
		{ href: '/tools', label: 'Tools' },
		{ href: '/community', label: 'Community' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}
</script>

<nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3">
				<span class="font-orbitron text-xl font-bold tracking-wider">
					Almanac<span class="text-solarpunk-teal">.</span>solar
				</span>
			</a>

			<!-- Desktop nav -->
			<div class="hidden md:flex items-center gap-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
							{isActive(item.href)
								? 'text-solarpunk-teal bg-solarpunk-teal/10'
								: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}"
					>
						{item.label}
					</a>
				{/each}
			</div>

			<!-- Right side -->
			<div class="flex items-center gap-4">
				<SeasonIndicator />
				<ThemeToggle />

				<!-- Auth buttons (for logged out users) -->
				<div class="hidden sm:flex items-center gap-2">
					<a href="/login" class="btn-ghost text-sm">Log in</a>
					<a href="/signup" class="btn-primary text-sm">Sign up</a>
				</div>

				<!-- Mobile menu button -->
				<button
					class="md:hidden p-2 rounded-lg hover:bg-slate-800/50"
					on:click={() => mobileMenuOpen = !mobileMenuOpen}
					aria-label="Toggle menu"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						{#if mobileMenuOpen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						{/if}
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="md:hidden glass border-t border-white/5">
			<div class="px-4 py-4 space-y-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="block px-4 py-3 rounded-lg text-base font-medium transition-colors
							{isActive(item.href)
								? 'text-solarpunk-teal bg-solarpunk-teal/10'
								: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}"
						on:click={() => mobileMenuOpen = false}
					>
						{item.label}
					</a>
				{/each}
				<hr class="border-slate-800 my-4" />
				<a href="/login" class="block px-4 py-3 text-slate-400 hover:text-slate-100">Log in</a>
				<a href="/signup" class="block px-4 py-3 btn-primary text-center">Sign up</a>
			</div>
		</div>
	{/if}
</nav>
