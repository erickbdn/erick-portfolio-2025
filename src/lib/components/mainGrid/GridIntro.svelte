<script lang="ts">
	import { onMount } from 'svelte';
	import {gsap} from 'gsap';
	import { onDestroy } from 'svelte';

	let headingSpans: HTMLSpanElement[] = [];
	let descEl: HTMLParagraphElement;

	const headingText = 'KIRE.DEV';

	onMount(() => {
		// Initial states
		gsap.set(headingSpans, { opacity: 0, y: -50 });
		gsap.set(descEl, { opacity: 0, y: 50 });

		const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } });

		tl.to(headingSpans, {
			opacity: 1,
			y: 0,
			stagger: 0.1,
			delay: 2.2
		}).to(
			descEl,
			{ opacity: 1, y: 0 },
			'-=0.8' // Overlap with end of heading animation
		);
	});

	onDestroy(() => {
		headingSpans.forEach(span => gsap.killTweensOf(span));
		gsap.killTweensOf(descEl);
	});
</script>

<header class="flex flex-col gap-4 -mt-4">
	<div class="overflow-hidden w-fit">
		<h1
			class="text-[8rem] font-black text-secondary font-alpino leading-none -mb-4 -ml-2 backdrop-blur-lg"
		>
			{#each headingText.split('') as letter, i}
				<span
					bind:this={headingSpans[i]}
					class="inline-block"
					style="opacity: 0"
				>
					{letter}
				</span>
			{/each}
		</h1>
	</div>

	<div class="overflow-hidden w-1/2">
		<p
			bind:this={descEl}
			class="text-[1rem] leading-tight text-secondary font-satoshi font-semibold w-fit backdrop-blur-lg"
			style="opacity: 0"
		>
			Aspiring Front End Web Developer with a keen eye for design, crafting intuitive UI/UX, and adapting to emerging tools and techniques.
		</p>
	</div>
</header>
