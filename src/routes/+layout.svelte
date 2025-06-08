<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/stores/ThemeStore';
	import { browser } from '$app/environment'; // To ensure onMount runs client-side
	import { onMount } from 'svelte';

	let { children } = $props();

	// Ensure the theme is applied on initial client-side load
	onMount(() => {
		if (browser) {
			// The store already attempts to set this, but this ensures it if store initializes before DOM is fully ready
			// or if there was any SSR mismatch (though ssr=false should prevent most of that).
			const currentTheme = localStorage.getItem('theme') || 'light';
			document.documentElement.dataset.theme = currentTheme;
			// Sync store if it somehow got out of sync (e.g. manual localStorage change)
			if ($theme !== currentTheme) {
				theme.set(currentTheme as 'light' | 'dark');
			}
		}
	});

	function toggleTheme() {
		theme.toggle();
	}
</script>

<div class="flex min-h-screen flex-col">
	<header class="sticky top-0 z-50 bg-white/80 shadow-sm backdrop-blur-md dark:bg-gray-900/80">
		<div class="container mx-auto flex items-center justify-between px-4 py-3">
			<div>
				<!-- Placeholder for Logo or App Name -->
				<span class="text-xl font-semibold text-gray-800 dark:text-gray-200"
					>Satisfactory Fabriken</span
				>
			</div>
			<button
				on:click={toggleTheme}
				class="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
				aria-label="Toggle theme"
			>
				{#if $theme === 'light'}
					<!-- Moon Icon for switching to dark mode -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
						/>
					</svg>
				{:else}
					<!-- Sun Icon for switching to light mode -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707.707M6.343 6.343l-.707-.707m12.728 0l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</header>
	<main class="container mx-auto flex-grow p-4">
		{@render children()}
	</main>
	<footer
		class="border-t border-gray-200 py-4 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
	>
		Satisfactory Fabriken Planner &copy; {new Date().getFullYear()}
	</footer>
</div>
