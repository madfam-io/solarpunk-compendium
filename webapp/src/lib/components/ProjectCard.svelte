<script lang="ts">
	export let project: {
		id: string;
		slug: string;
		name: string;
		tagline: string;
		location?: string;
		coverImage?: string;
		categories: string[];
		sdgs: number[];
		featured?: boolean;
	};

	const sdgColors: Record<number, string> = {
		1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D', 5: '#FF3A21',
		6: '#26BDE2', 7: '#FCC30B', 8: '#A21942', 9: '#FD6925', 10: '#DD1367',
		11: '#FD9D24', 12: '#BF8B2E', 13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B',
		16: '#00689D', 17: '#19486A'
	};
</script>

<a
	href="/directory/{project.slug}"
	class="card group hover:border-solarpunk-teal/30 transition-all flex flex-col"
>
	<!-- Cover image -->
	{#if project.coverImage}
		<div class="relative h-40 -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden">
			<img
				src={project.coverImage}
				alt={project.name}
				class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
			/>
			{#if project.featured}
				<span class="absolute top-3 right-3 badge-gold">Featured</span>
			{/if}
		</div>
	{:else}
		<div class="relative h-40 -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden bg-gradient-to-br from-solarpunk-teal/20 to-solar-gold/20 flex items-center justify-center">
			<span class="text-5xl opacity-50">🌱</span>
			{#if project.featured}
				<span class="absolute top-3 right-3 badge-gold">Featured</span>
			{/if}
		</div>
	{/if}

	<!-- Content -->
	<div class="flex-1 flex flex-col">
		<h3 class="font-orbitron font-bold text-lg mb-1 group-hover:text-solarpunk-teal transition-colors">
			{project.name}
		</h3>

		{#if project.location}
			<p class="text-xs text-slate-500 mb-2 flex items-center gap-1">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
					<circle cx="12" cy="10" r="3" />
				</svg>
				{project.location}
			</p>
		{/if}

		<p class="text-sm text-slate-400 mb-4 flex-1 line-clamp-2">
			{project.tagline}
		</p>

		<!-- Categories -->
		<div class="flex flex-wrap gap-2 mb-3">
			{#each project.categories.slice(0, 2) as category}
				<span class="badge-teal">{category}</span>
			{/each}
		</div>

		<!-- SDG dots -->
		<div class="flex gap-1">
			{#each project.sdgs.slice(0, 5) as sdg}
				<span
					class="w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold text-white"
					style="background-color: {sdgColors[sdg]}"
					title="SDG {sdg}"
				>
					{sdg}
				</span>
			{/each}
			{#if project.sdgs.length > 5}
				<span class="w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold bg-slate-700 text-slate-400">
					+{project.sdgs.length - 5}
				</span>
			{/if}
		</div>
	</div>
</a>
