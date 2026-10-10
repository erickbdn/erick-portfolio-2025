<script>
	import About from '$lib/components/About/About.svelte';
	import EduExp from '$lib/components/About/EduExp.svelte';
	import HobInt from '$lib/components/About/HobInt.svelte';
</script>

<div class="relative h-[100svh] p-4">
	<!-- The grid itself -->
	<div class="relative grid h-full grid-cols-2 grid-rows-2 gap-4 overflow-hidden">
		<About />
		<div></div>
		<EduExp />
		<HobInt />
	</div>
</div>
