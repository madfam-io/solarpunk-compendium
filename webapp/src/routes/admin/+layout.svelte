<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: '◉' },
		{ href: '/admin/editions', label: 'Editions', icon: '◈' },
		{ href: '/admin/articles', label: 'Articles', icon: '◇' },
		{ href: '/admin/posts', label: 'Greenhouse', icon: '❋' },
		{ href: '/admin/authors', label: 'Authors', icon: '◎' },
		{ href: '/admin/harvest', label: 'Harvest', icon: '⚘' }
	];

	$: currentPath = $page.url.pathname;
</script>

<div class="min-h-screen bg-slate-950">
	<!-- Admin Header -->
	<header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-6">
					<a href="/admin" class="font-orbitron text-xl font-bold">
						<span class="text-solarpunk-gold">Solstice</span>
						<span class="text-slate-400 text-sm ml-1">CMS</span>
					</a>
					<nav class="hidden md:flex items-center gap-1">
						{#each navItems as item}
							<a
								href={item.href}
								class="px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors
									{currentPath === item.href || (item.href !== '/admin' && currentPath.startsWith(item.href))
									? 'bg-slate-800 text-white'
									: 'text-slate-400 hover:text-white hover:bg-slate-800/50'}"
							>
								<span class="text-xs">{item.icon}</span>
								{item.label}
							</a>
						{/each}
					</nav>
				</div>
				<div class="flex items-center gap-4">
					<a href="/" class="text-sm text-slate-400 hover:text-white">
						← Back to Site
					</a>
				</div>
			</div>
		</div>
	</header>

	<!-- Content -->
	<main>
		<slot />
	</main>
</div>
