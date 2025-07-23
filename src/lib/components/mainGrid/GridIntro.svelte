<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { get } from 'svelte/store';
	import { gridIntroHasSeenIntro } from '$lib/stores/intro';
	import { isNavigatingAway } from '$lib/stores/exitTransition';

	let headingSpans: HTMLSpanElement[] = [];
	let descEl: HTMLParagraphElement;
	const headingText = 'KIRE.DEV';

	let timeline: gsap.core.Timeline;
	let unsubscribe: () => void;

	onMount(() => {
		const hasSeen = get(gridIntroHasSeenIntro);

		const duration = hasSeen ? 0.7 : 1.2;
		const delay = hasSeen ? 0.2 : 2.2;

		gsap.set(headingSpans, { opacity: 0, y: -50 });
		gsap.set(descEl, { opacity: 0, y: 50 });

		timeline = gsap.timeline({ defaults: { ease: 'expo.out', duration } });

		timeline
			.to(headingSpans, {
				opacity: 1,
				y: 0,
				stagger: 0.1,
				delay
			})
			.to(descEl, { opacity: 1, y: 0 }, `-=${hasSeen ? 0.4 : 0.8}`);

		gridIntroHasSeenIntro.set(true);
		unsubscribe = isNavigatingAway.subscribe((val) => {
		if (val) {
			// Exit animation
			gsap.to(headingSpans, {
				opacity: 0,
				y: 50,
				duration: 1.2,
				ease: 'circ.inOut'
			});
			gsap.to(descEl, {
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
	gsap.killTweensOf(descEl);
	if (unsubscribe) unsubscribe();
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
