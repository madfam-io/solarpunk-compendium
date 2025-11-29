<script lang="ts">
	const chapters = [
		{
			name: 'Berlin Solarpunk',
			location: 'Berlin, Germany',
			members: 45,
			status: 'active',
			description: 'Building urban gardens and organizing climate action in Berlin.'
		},
		{
			name: 'Bay Area Regenerators',
			location: 'San Francisco, USA',
			members: 78,
			status: 'active',
			description: 'Tech workers building sustainable alternatives in Silicon Valley.'
		},
		{
			name: 'São Paulo Futuros',
			location: 'São Paulo, Brazil',
			members: 32,
			status: 'active',
			description: 'Art and permaculture collective in South America\'s largest city.'
		},
		{
			name: 'Tokyo Green Future',
			location: 'Tokyo, Japan',
			members: 24,
			status: 'forming',
			description: 'Exploring solarpunk in one of the world\'s most urban environments.'
		}
	];

	const upcomingEvents = [
		{
			title: 'Community Seed Swap',
			chapter: 'Bay Area Regenerators',
			date: '2025-12-15',
			type: 'in-person'
		},
		{
			title: 'Solar Panel Workshop',
			chapter: 'Berlin Solarpunk',
			date: '2025-12-20',
			type: 'hybrid'
		},
		{
			title: 'Global Solstice Gathering',
			chapter: 'All Chapters',
			date: '2025-12-21',
			type: 'online'
		}
	];
</script>

<svelte:head>
	<title>Community | The Solarpunk Almanac</title>
	<meta name="description" content="Join local chapters building regenerative futures. Connect with solarpunks in your area." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<!-- Header -->
	<div class="text-center mb-16">
		<h1 class="font-orbitron text-4xl md:text-5xl font-bold mb-4">
			<span class="gradient-text">Community</span> Network
		</h1>
		<p class="text-lg text-slate-400 max-w-2xl mx-auto">
			Local chapters building regenerative futures together. Find your people, or start something new.
		</p>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
		<div class="card text-center">
			<div class="text-3xl font-orbitron font-bold text-solarpunk-teal">12</div>
			<div class="text-sm text-slate-400">Active Chapters</div>
		</div>
		<div class="card text-center">
			<div class="text-3xl font-orbitron font-bold text-solar-gold">8</div>
			<div class="text-sm text-slate-400">Countries</div>
		</div>
		<div class="card text-center">
			<div class="text-3xl font-orbitron font-bold text-leaf-green">320+</div>
			<div class="text-sm text-slate-400">Members</div>
		</div>
		<div class="card text-center">
			<div class="text-3xl font-orbitron font-bold text-sky-blue">45</div>
			<div class="text-sm text-slate-400">Events This Year</div>
		</div>
	</div>

	<div class="grid lg:grid-cols-3 gap-8">
		<!-- Chapters list -->
		<div class="lg:col-span-2">
			<h2 class="font-orbitron text-2xl font-bold mb-6">Active Chapters</h2>

			<div class="space-y-4">
				{#each chapters as chapter}
					<div class="card hover:border-solarpunk-teal/30 transition-all cursor-pointer">
						<div class="flex items-start justify-between">
							<div>
								<div class="flex items-center gap-3 mb-2">
									<h3 class="font-orbitron font-bold">{chapter.name}</h3>
									<span class="badge-{chapter.status === 'active' ? 'green' : 'gold'}">
										{chapter.status === 'active' ? 'Active' : 'Forming'}
									</span>
								</div>
								<p class="text-sm text-slate-500 flex items-center gap-1 mb-2">
									<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
										<circle cx="12" cy="10" r="3" />
									</svg>
									{chapter.location}
								</p>
								<p class="text-sm text-slate-400">{chapter.description}</p>
							</div>
							<div class="text-right">
								<div class="text-2xl font-orbitron font-bold text-solarpunk-teal">{chapter.members}</div>
								<div class="text-xs text-slate-500">members</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Start a chapter CTA -->
			<div class="card gradient-border mt-8">
				<div class="p-2">
					<h3 class="font-orbitron font-bold text-xl mb-2">Don't see your area?</h3>
					<p class="text-slate-400 mb-4">
						Start a chapter in your community. We provide resources, guides, and support to help you get going.
					</p>
					<a href="/chapters/start" class="btn-primary">
						Start a Chapter
					</a>
				</div>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Upcoming events -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-4">Upcoming Events</h2>
				<div class="space-y-4">
					{#each upcomingEvents as event}
						<div class="p-3 rounded-lg bg-slate-800/50">
							<div class="font-medium text-sm">{event.title}</div>
							<div class="text-xs text-slate-500 mt-1">{event.chapter}</div>
							<div class="flex items-center justify-between mt-2">
								<span class="text-xs text-slate-400">
									{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
								</span>
								<span class="badge-teal text-xs">{event.type}</span>
							</div>
						</div>
					{/each}
				</div>
				<a href="/events" class="block text-center text-sm text-solarpunk-teal hover:underline mt-4">
					View all events →
				</a>
			</div>

			<!-- Join online community -->
			<div class="card">
				<h2 class="font-orbitron font-bold mb-4">Join Online</h2>
				<p class="text-sm text-slate-400 mb-4">
					Connect with solarpunks worldwide in our online spaces.
				</p>
				<div class="space-y-2">
					<a href="#" class="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
						<span class="text-xl">💬</span>
						<span class="text-sm">Discord Server</span>
					</a>
					<a href="#" class="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
						<span class="text-xl">🐘</span>
						<span class="text-sm">Mastodon Community</span>
					</a>
					<a href="#" class="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
						<span class="text-xl">📧</span>
						<span class="text-sm">Newsletter</span>
					</a>
				</div>
			</div>

			<!-- Values reminder -->
			<div class="card bg-gradient-to-br from-solarpunk-teal/10 to-leaf-green/10">
				<h3 class="font-semibold mb-2">Community Values</h3>
				<ul class="text-sm text-slate-400 space-y-1">
					<li>🌱 Regenerative practice</li>
					<li>🤝 Mutual aid & solidarity</li>
					<li>🌍 Local action, global connection</li>
					<li>📖 Open knowledge sharing</li>
				</ul>
			</div>
		</div>
	</div>
</div>
