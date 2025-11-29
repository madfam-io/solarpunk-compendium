<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { initializeAuth, isLoading } from '$lib/stores/auth';

	// Initialize authentication on app load
	onMount(() => {
		initializeAuth();
	});
</script>

<div class="min-h-screen flex flex-col">
	<Nav />
	<main class="flex-1 pt-16">
		<slot />
	</main>
	<Footer />
</div>
