<script lang="ts">
	const currentYear = new Date().getFullYear();

	const footerLinks = {
		explore: [
			{ href: '/directory', label: 'Project Directory' },
			{ href: '/editions', label: 'Seasonal Editions' },
			{ href: '/tools', label: 'Practical Tools' },
			{ href: '/community', label: 'Community' }
		],
		resources: [
			{ href: '/about', label: 'About Us' },
			{ href: '/mission', label: 'Our Mission' },
			{ href: '/contribute', label: 'Contribute' },
			{ href: '/chapters', label: 'Start a Chapter' }
		],
		connect: [
			{ href: '#', label: 'Mastodon', icon: 'mastodon' },
			{ href: '#', label: 'GitHub', icon: 'github' },
			{ href: '#', label: 'Newsletter', icon: 'mail' }
		]
	};
</script>

<footer class="border-t border-white/5 bg-slate-950/50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
			<!-- Brand -->
			<div class="col-span-2 md:col-span-1">
				<a href="/" class="font-orbitron text-xl font-bold tracking-wider">
					Almanac<span class="text-solarpunk-teal">.</span>solar
				</a>
				<p class="mt-4 text-sm text-slate-400">
					Practical wisdom for regenerative living.
				</p>
				<p class="mt-2 text-xs text-slate-500">
					A project by Innovaciones MADFAM
				</p>
			</div>

			<!-- Explore -->
			<div>
				<h3 class="font-semibold text-slate-200 mb-4">Explore</h3>
				<ul class="space-y-2">
					{#each footerLinks.explore as link}
						<li>
							<a href={link.href} class="text-sm text-slate-400 hover:text-solarpunk-teal transition-colors">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Resources -->
			<div>
				<h3 class="font-semibold text-slate-200 mb-4">Resources</h3>
				<ul class="space-y-2">
					{#each footerLinks.resources as link}
						<li>
							<a href={link.href} class="text-sm text-slate-400 hover:text-solarpunk-teal transition-colors">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Connect -->
			<div>
				<h3 class="font-semibold text-slate-200 mb-4">Connect</h3>
				<div class="flex gap-4">
					<!-- Mastodon -->
					<a href="#" class="text-slate-400 hover:text-solarpunk-teal transition-colors" title="Mastodon">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>
						</svg>
					</a>
					<!-- GitHub -->
					<a href="#" class="text-slate-400 hover:text-solarpunk-teal transition-colors" title="GitHub">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
						</svg>
					</a>
					<!-- Bluesky -->
					<a href="#" class="text-slate-400 hover:text-solarpunk-teal transition-colors" title="Bluesky">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
						</svg>
					</a>
				</div>
			</div>
		</div>

		<!-- Bottom -->
		<div class="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
			<p class="text-xs text-slate-500">
				&copy; {currentYear} The Solarpunk Almanac. Open source. Open future.
			</p>
			<p class="text-xs text-slate-500 italic">
				"Move quietly and plant things."
			</p>
		</div>
	</div>
</footer>
