<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { isNavigatingAway } from '$lib/stores/exitTransition';

	let headingSpans: HTMLSpanElement[] = [];
	let titleEl: HTMLParagraphElement;
	let descEl: HTMLParagraphElement;
	const headingText = "Hi, I'm Erick!";

	let timeline: gsap.core.Timeline;
	let unsubscribe: () => void;

	onMount(() => {
		const duration = 1.2;

		// Set initial states
		gsap.set(headingSpans, { opacity: 0, y: -50 });
		gsap.set(titleEl, { opacity: 0, y: 50 });
		gsap.set(descEl, { opacity: 0, y: 50 });

		// Create timeline
		timeline = gsap.timeline({ defaults: { ease: 'expo.out', duration } });

		timeline
			.to(headingSpans, {
				opacity: 1,
				y: 0,
				stagger: 0.1
			})
			.to(titleEl, { opacity: 1, y: 0 }, `-=0.8`)
			.to(descEl, { opacity: 1, y: 0 }, `-=0.6`);

		// Subscribe to navigation changes for exit animation
		unsubscribe = isNavigatingAway.subscribe((val) => {
			if (val) {
				// Exit animation
				gsap.to(headingSpans, {
					opacity: 0,
					y: 50,
					duration: 1.2,
					ease: 'circ.inOut'
				});
				gsap.to([titleEl, descEl], {
					opacity: 0,
					y: 50,
					duration: 1.2,
					ease: 'circ.inOut'
				});
			}
		});
	});

	onDestroy(() => {
		if (timeline) timeline.kill();
		headingSpans.forEach((span) => gsap.killTweensOf(span));
		gsap.killTweensOf([titleEl, descEl]);
		if (unsubscribe) unsubscribe();
	});
</script>

<header class="-mt-4 flex flex-col gap-4">
	<div class="w-fit">
		<h1
			class="text-secondary font-alpino -mb-4 -ml-2 text-[6rem] leading-none font-black backdrop-blur-lg"
		>
			{#each headingText.split('') as letter, i}
				<span bind:this={headingSpans[i]} class="inline-block" style="opacity: 0">
					{@html letter === ' ' ? '&nbsp;' : letter}
				</span>
			{/each}
		</h1>
	</div>

	<div class="w-full overflow-hidden">
		<p
			bind:this={titleEl}
			class="text-secondary font-satoshi w-fit text-[1rem] font-semibold backdrop-blur-lg"
			style="opacity: 0"
		>
			Frontend Developer | Bachelor of Computer Science from BINUS University
		</p>
	</div>

	<div class="mt-8 w-3/4 overflow-hidden">
		<p
			bind:this={descEl}
			class="text-md text-secondary font-satoshi font-regular text-bottom w-fit leading-tight backdrop-blur-lg"
			style="opacity: 0"
		>
			I'm a frontend developer with a deep love for UI design, motion, and interaction. I enjoy
			building fast, thoughtful interfaces with a strong focus on user experience and engaging
			visuals.
		</p>
	</div>
</header>
