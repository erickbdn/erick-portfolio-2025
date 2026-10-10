<!-- layout.svelte -->
<script lang="ts">
	import '../app.css';
	import ThreeBackground from '$lib/components/Three/ThreeBackground.svelte';
	import GridNavigation from '$lib/components/mainGrid/GridNavigation.svelte';
</script>

<!-- Background layer (non-interactive) -->
<div class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
	<ThreeBackground />
</div>

<!-- GridNavigation layer (interactive, follows 2x2 layout) -->
<div class="pointer-events-none absolute inset-0 z-50">
	<div class="grid h-full grid-cols-2 grid-rows-2 gap-4 p-4">
		<div></div>
		<!-- This is where GridNavigation shows up (top-right cell) -->
		<div class="pointer-events-none">
			<GridNavigation />
		</div>
		<div></div>
		<div></div>
	</div>
</div>

<!-- Page content slot -->
<!-- DO NOT add any visibility/opacity manipulation here -->
<slot />
