<script lang="ts">
	import { page } from '$app/stores';
	import { user, isAuthenticated, userInitials, auth } from '$lib/stores/auth';
	import ThemeToggle from './ThemeToggle.svelte';
	import SeasonIndicator from './SeasonIndicator.svelte';

	let mobileMenuOpen = false;
	let userMenuOpen = false;

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

	async function handleSignOut() {
		userMenuOpen = false;
		await auth.signOut('/');
	}

	function handleWindowClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (userMenuOpen && !target.closest('.relative')) {
			userMenuOpen = false;
		}
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

				{#if $isAuthenticated && $user}
					<!-- Authenticated user menu -->
					<div class="relative">
						<button
							on:click={() => userMenuOpen = !userMenuOpen}
							class="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
						>
							{#if $user.avatar}
								<img
									src={$user.avatar}
									alt={$user.firstName || $user.email}
									class="w-8 h-8 rounded-full object-cover"
								/>
							{:else}
								<div class="w-8 h-8 rounded-full bg-solarpunk-teal/20 text-solarpunk-teal flex items-center justify-center text-sm font-medium">
									{$userInitials}
								</div>
							{/if}
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="m6 9 6 6 6-6"/>
							</svg>
						</button>

						{#if userMenuOpen}
							<!-- Dropdown menu -->
							<div class="absolute right-0 mt-2 w-56 glass rounded-lg shadow-xl border border-white/10 py-2">
								<div class="px-4 py-2 border-b border-slate-700">
									<p class="text-sm font-medium truncate">
										{$user.firstName ? `${$user.firstName} ${$user.lastName || ''}` : $user.email}
									</p>
									<p class="text-xs text-slate-500 truncate">{$user.email}</p>
								</div>

								<a
									href="/profile"
									on:click={() => userMenuOpen = false}
									class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
								>
									Your Profile
								</a>
								<a
									href="/settings"
									on:click={() => userMenuOpen = false}
									class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
								>
									Settings
								</a>
								<a
									href="/directory/submit"
									on:click={() => userMenuOpen = false}
									class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
								>
									Submit Project
								</a>

								<hr class="border-slate-700 my-2" />

								<button
									on:click={handleSignOut}
									class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
								>
									Sign out
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Auth buttons (for logged out users) -->
					<div class="hidden sm:flex items-center gap-2">
						<a href="/login" class="btn-ghost text-sm">Log in</a>
						<a href="/signup" class="btn-primary text-sm">Sign up</a>
					</div>
				{/if}

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

				{#if $isAuthenticated && $user}
					<div class="px-4 py-2 mb-2">
						<p class="text-sm font-medium">{$user.firstName || $user.email}</p>
						<p class="text-xs text-slate-500">{$user.email}</p>
					</div>
					<a href="/profile" on:click={() => mobileMenuOpen = false} class="block px-4 py-3 text-slate-400 hover:text-slate-100">
						Your Profile
					</a>
					<a href="/settings" on:click={() => mobileMenuOpen = false} class="block px-4 py-3 text-slate-400 hover:text-slate-100">
						Settings
					</a>
					<button
						on:click={handleSignOut}
						class="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg"
					>
						Sign out
					</button>
				{:else}
					<a href="/login" on:click={() => mobileMenuOpen = false} class="block px-4 py-3 text-slate-400 hover:text-slate-100">
						Log in
					</a>
					<a href="/signup" on:click={() => mobileMenuOpen = false} class="block px-4 py-3 btn-primary text-center">
						Sign up
					</a>
				{/if}
			</div>
		</div>
	{/if}
</nav>

<!-- Click outside to close menus -->
<svelte:window on:click={handleWindowClick} />
