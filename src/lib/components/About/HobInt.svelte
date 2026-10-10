<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { isNavigatingAway } from '$lib/stores/exitTransition';

	const interests = [
		'Motion systems',
		'Creative coding',
		'Interface details',
		'WebGL experiments',
		'Design references',
		'Continuous learning'
	];

	let sectionRef: HTMLElement;
	let headingRef: HTMLHeadingElement;
	let copyRef: HTMLParagraphElement;
	let itemRefs: HTMLLIElement[] = [];
	let unsubscribe: () => void;
	let timeline: gsap.core.Timeline;

	onMount(() => {
		timeline = gsap.timeline({ defaults: { duration: 1.2, ease: 'expo.out' } });
		gsap.set([headingRef, copyRef, ...itemRefs], { opacity: 0, y: 50 });

		timeline
			.to(headingRef, { opacity: 1, y: 0, delay: 0.4 })
			.to(copyRef, { opacity: 1, y: 0 }, '-=0.8')
			.to(itemRefs, { opacity: 1, y: 0, stagger: 0.08 }, '-=0.7');

		unsubscribe = isNavigatingAway.subscribe((val) => {
			if (!val) return;
			gsap.to([headingRef, copyRef, ...itemRefs], {
				opacity: 0,
				y: 50,
				duration: 1,
				ease: 'circ.inOut',
				stagger: 0.03
			});
		});
	});

	onDestroy(() => {
		timeline?.kill();
		gsap.killTweensOf([headingRef, copyRef, ...itemRefs]);
		unsubscribe?.();
	});
</script>

<section bind:this={sectionRef} class="flex h-full flex-col justify-end overflow-hidden text-right">
	<div class="ml-auto max-w-[34rem] backdrop-blur-lg">
		<h2
			bind:this={headingRef}
			class="font-satoshi text-secondary text-4xl leading-none font-black"
			style="opacity: 0"
		>
			OFFSCREEN STUDIES
		</h2>
	</div>

	<p
		bind:this={copyRef}
		class="font-satoshi text-secondary-80 mt-4 ml-auto max-w-[42ch] text-sm leading-tight backdrop-blur-lg"
		style="opacity: 0"
	>
		A little outside the job title, I keep circling the same things: visual systems, expressive
		motion, tiny interaction details, and the strange fun of making the browser feel less flat.
	</p>

	<ul class="font-satoshi mt-6 ml-auto flex max-w-[34rem] flex-wrap justify-end gap-2">
		{#each interests as interest, i}
			<li
				bind:this={itemRefs[i]}
				class="border-secondary-30 text-secondary rounded-sm border px-3 py-2 text-xs font-bold uppercase backdrop-blur-lg"
				style="opacity: 0"
			>
				{interest}
			</li>
		{/each}
	</ul>
</section>
