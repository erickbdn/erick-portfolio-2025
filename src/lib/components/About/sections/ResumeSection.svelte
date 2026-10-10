<script lang="ts">
	const highlights = [
		'Frontend development with SvelteKit, TypeScript, Tailwind, and component-first UI.',
		'Motion and interaction work with GSAP and Three.js.',
		'Comfortable translating visual direction into responsive, production-minded interfaces.'
	];
</script>

<div class="font-satoshi mt-8 flex h-full flex-col justify-between gap-8">
	<div class="flex flex-col gap-5">
		<p class="text-secondary-80 max-w-[48ch] text-sm leading-tight">
			A concise resume can live here once the final PDF is ready. For now, this panel keeps the
			important signal close: frontend craft, motion, UI polish, and a practical engineering
			foundation.
		</p>

		<ul class="flex flex-col gap-3">
			{#each highlights as highlight}
				<li class="border-secondary-30 text-secondary border-t pt-3 text-sm leading-tight">
					{highlight}
				</li>
			{/each}
		</ul>
	</div>

	<div class="flex flex-wrap gap-3">
		<a
			href="mailto:erickkbdn8120@gmail.com"
			class="bg-secondary text-primary hover:bg-secondary-80 rounded-sm px-4 py-2 text-sm font-bold transition"
		>
			Email me
		</a>
		<a
			href="https://www.linkedin.com/in/tederick-budiono/"
			target="_blank"
			rel="noopener"
			class="border-secondary-30 text-secondary hover:bg-secondary-15 rounded-sm border px-4 py-2 text-sm font-bold backdrop-blur-lg transition"
		>
			LinkedIn
		</a>
	</div>
</div>
