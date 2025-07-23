<!-- layout.svelte -->
<script lang="ts">
	import '../app.css';
	import ThreeBackground from '$lib/components/Three/ThreeBackground.svelte';
	import { triggerExplosion } from '$lib/stores/transition';

	let exploding = false;

	const unsubscribe = triggerExplosion.subscribe((v) => {
		exploding = v;
	});

	// optional: clean up
	import { onDestroy } from 'svelte';
	onDestroy(() => unsubscribe());
</script>

<!-- Three.js background, persistent across pages -->
<div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
	<ThreeBackground />
</div>

<!-- Page content slot -->
<!-- DO NOT add any visibility/opacity manipulation here -->
<slot />
