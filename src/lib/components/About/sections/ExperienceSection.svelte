<script lang="ts">
	const experience = [
		{
			role: 'Frontend Developer',
			meta: 'Current professional focus',
			points: [
				'Building responsive interfaces with a strong eye for layout, motion, and state.',
				'Turning product ideas into usable flows with clean component structure.',
				'Working across design details, browser behavior, and performance constraints.'
			]
		},
		{
			role: 'Portfolio / Creative Coding',
			meta: 'Selected practice',
			points: [
				'Exploring GSAP and Three.js for expressive page transitions and WebGL visuals.',
				'Using Sanity-backed content structures for project previews and case-study data.'
			]
		}
	];
</script>

<div class="font-satoshi mt-8 flex flex-col gap-6">
	{#each experience as item}
		<article class="border-secondary-30 border-t pt-4">
			<div class="mb-3 flex items-baseline justify-between gap-4">
				<h3 class="text-secondary text-lg font-bold">{item.role}</h3>
				<span class="text-secondary-60 text-xs uppercase">{item.meta}</span>
			</div>

			<ul class="flex flex-col gap-2">
				{#each item.points as point}
					<li class="text-secondary-80 text-sm leading-tight">{point}</li>
				{/each}
			</ul>
		</article>
	{/each}
</div>
