<script lang="ts">
	import SeasonIndicator from '$lib/components/SeasonIndicator.svelte';

	let email = '';
	let signupMessage = '';
	let signupSuccess = false;

	async function handleSignup(e: Event) {
		e.preventDefault();
		// TODO: Integrate with email service
		signupMessage = `Thanks! We'll be in touch at ${email}`;
		signupSuccess = true;
		email = '';
	}

	const features = [
		{
			icon: '📚',
			title: 'Seasonal Editions',
			description: 'Quarterly guides aligned with solstices and equinoxes. Practical wisdom for each season.',
			href: '/editions'
		},
		{
			icon: '🌍',
			title: 'Global Directory',
			description: 'Find projects, chapters, and organizations building regenerative futures near you.',
			href: '/directory'
		},
		{
			icon: '🛠️',
			title: 'Practical Tools',
			description: 'Guides, templates, and calculators for energy, food, community organizing, and more.',
			href: '/tools'
		}
	];

	const sdgIcons = [
		{ icon: '⚡', title: 'SDG 7: Clean Energy' },
		{ icon: '🏙️', title: 'SDG 11: Sustainable Cities' },
		{ icon: '♻️', title: 'SDG 12: Responsible Consumption' },
		{ icon: '🌡️', title: 'SDG 13: Climate Action' },
		{ icon: '🌳', title: 'SDG 15: Life on Land' },
		{ icon: '🤝', title: 'SDG 17: Partnerships' }
	];
</script>

<svelte:head>
	<title>The Solarpunk Almanac | Practical Wisdom for Regenerative Living</title>
	<meta name="description" content="Your guide to building tomorrow, today. Seasonal wisdom, practical tools, and a global community working toward flourishing futures." />
</svelte:head>

<!-- Hero Section -->
<section class="min-h-[90vh] flex flex-col items-center justify-center px-4 py-20">
	<div class="max-w-4xl mx-auto text-center">
		<!-- Main heading -->
		<h1 class="font-orbitron text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
			The Solarpunk<br />
			<span class="gradient-text">Almanac</span>
		</h1>

		<!-- Tagline -->
		<p class="text-xl md:text-2xl text-slate-400 mb-4 max-w-2xl mx-auto">
			Practical wisdom for regenerative living
		</p>

		<p class="text-lg text-slate-500 mb-12 max-w-xl mx-auto">
			Your guide to building tomorrow, today. Seasonal wisdom, practical tools, and a global community working toward flourishing futures.
		</p>

		<!-- Email signup -->
		<div class="card max-w-lg mx-auto mb-12">
			<h2 class="font-orbitron text-lg font-bold mb-2">Join the First Seed</h2>
			<p class="text-sm text-slate-400 mb-6">
				Be among the founding members. Get early access to our first Seasonal Edition.
			</p>

			<form on:submit={handleSignup} class="flex flex-col sm:flex-row gap-3">
				<input
					type="email"
					bind:value={email}
					placeholder="your@email.com"
					required
					class="input flex-1"
				/>
				<button type="submit" class="btn-primary whitespace-nowrap">
					Plant a Seed
				</button>
			</form>

			{#if signupMessage}
				<p class="text-sm mt-4 {signupSuccess ? 'text-leaf-green' : 'text-red-400'}">
					{signupMessage}
				</p>
			{/if}

			<p class="text-xs text-slate-500 mt-4">
				No spam. Unsubscribe anytime. We respect your data like we respect the earth.
			</p>
		</div>

		<!-- CTA buttons -->
		<div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
			<a href="/directory" class="btn-primary text-lg px-8 py-4">
				Explore Directory
			</a>
			<a href="/editions" class="btn-secondary text-lg px-8 py-4">
				View Editions
			</a>
		</div>
	</div>
</section>

<!-- Features Grid -->
<section class="py-20 px-4">
	<div class="max-w-6xl mx-auto">
		<h2 class="font-orbitron text-3xl font-bold text-center mb-12">
			What We're Building
		</h2>

		<div class="grid md:grid-cols-3 gap-6">
			{#each features as feature}
				<a href={feature.href} class="card group hover:border-solarpunk-teal/30 transition-all">
					<div class="text-4xl mb-4">{feature.icon}</div>
					<h3 class="font-orbitron font-bold mb-2 group-hover:text-solarpunk-teal transition-colors">
						{feature.title}
					</h3>
					<p class="text-sm text-slate-400">
						{feature.description}
					</p>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- SDG Alignment -->
<section class="py-20 px-4 bg-slate-900/50">
	<div class="max-w-4xl mx-auto text-center">
		<h2 class="font-orbitron text-2xl font-bold mb-6">
			Aligned with the UN Sustainable Development Goals
		</h2>

		<div class="flex flex-wrap justify-center gap-4 mb-6">
			{#each sdgIcons as sdg}
				<span class="text-3xl" title={sdg.title}>{sdg.icon}</span>
			{/each}
		</div>

		<p class="text-slate-400 max-w-2xl mx-auto">
			Solarpunk provides a narrative framework for achieving all 17 SDGs through an integrated, aesthetically compelling vision of flourishing futures.
		</p>
	</div>
</section>

<!-- Stats/Social proof (placeholder) -->
<section class="py-20 px-4">
	<div class="max-w-6xl mx-auto">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
			<div>
				<div class="text-4xl font-orbitron font-bold text-solarpunk-teal">50+</div>
				<div class="text-sm text-slate-400 mt-1">Projects Listed</div>
			</div>
			<div>
				<div class="text-4xl font-orbitron font-bold text-solar-gold">12</div>
				<div class="text-sm text-slate-400 mt-1">Countries</div>
			</div>
			<div>
				<div class="text-4xl font-orbitron font-bold text-leaf-green">17</div>
				<div class="text-sm text-slate-400 mt-1">SDGs Covered</div>
			</div>
			<div>
				<div class="text-4xl font-orbitron font-bold text-sky-blue">∞</div>
				<div class="text-sm text-slate-400 mt-1">Possibilities</div>
			</div>
		</div>
	</div>
</section>
