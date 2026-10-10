<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { gridCTAHasSeenIntro } from '$lib/stores/intro';
	import { get } from 'svelte/store';
	import { isNavigatingAway } from '$lib/stores/exitTransition'; // ✅ add this

	let titleRef: HTMLHeadingElement;
	let descRef: HTMLParagraphElement;
	let infoRef: HTMLDivElement;
	let buttonRef: HTMLAnchorElement;

	let titleWrapperRef: HTMLDivElement;
	let descWrapperRef: HTMLDivElement;
	let infoWrapperRef: HTMLDivElement;
	let buttonWrapperRef: HTMLDivElement;

	let hoverTimeline: gsap.core.Timeline | null = null;
	let hoverHandler: (() => void) | null = null;

	let unsubscribe: () => void; // ✅

	onMount(() => {
		const hasSeen = get(gridCTAHasSeenIntro);

		const duration = hasSeen ? 0.7 : 1.2;
		const delay = hasSeen ? 0.2 : 2.2;

		gsap.set([titleRef, descRef, infoRef, buttonWrapperRef], { opacity: 0, y: 50 });

		const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration } });
		const overlap = hasSeen ? '-=0.6' : '-=1';
		tl.to(titleRef, { opacity: 1, y: 0, delay })
			.to(descRef, { opacity: 1, y: 0, delay: 0.2 }, overlap)
			.to(infoRef, { opacity: 1, y: 0, delay: 0.2 }, overlap)
			.to(buttonWrapperRef, { opacity: 1, y: 0, delay: 0.2 }, overlap);

		// ✅ Exit animation
		unsubscribe = isNavigatingAway.subscribe((exit) => {
			if (exit) {
				gsap.to([titleRef, descRef, infoRef, buttonWrapperRef], {
					opacity: 0,
					y: 50,
					duration: 1.2,
					ease: 'expo.inOut',
					stagger: 0.05
				});
			}
		});

		// Hover animation for the button
		const span = buttonRef.querySelector('span span') as HTMLSpanElement;
		if (span) {
			hoverTimeline = gsap.timeline({ paused: true });
			hoverTimeline.to(span, { duration: 0.2, yPercent: -150, ease: 'power2.in' });
			hoverTimeline.set(span, { yPercent: 150 });
			hoverTimeline.to(span, { duration: 0.2, yPercent: 0 });

			hoverHandler = () => hoverTimeline && hoverTimeline.play(0);
			buttonRef.addEventListener('mouseenter', hoverHandler);
		}

		gridCTAHasSeenIntro.set(true);
	});

	onDestroy(() => {
		gsap.killTweensOf([titleRef, descRef, infoRef, buttonWrapperRef]);

		if (hoverTimeline) {
			hoverTimeline.kill();
			hoverTimeline = null;
		}
		if (buttonRef && hoverHandler) {
			buttonRef.removeEventListener('mouseenter', hoverHandler);
			hoverHandler = null;
		}
		if (unsubscribe) unsubscribe(); // ✅
	});
</script>

<section class="relative flex h-full flex-col items-end justify-end text-right">
	<!-- Title -->
	<div class="w-fit overflow-hidden backdrop-blur-lg" bind:this={titleWrapperRef}>
		<h2
			bind:this={titleRef}
			class="font-satoshi text-secondary text-3xl font-black"
			style="opacity: 0; transform: translateY(50px);"
		>
			Let's work together!
		</h2>
	</div>

	<!-- Description -->
	<div class="mt-2 w-fit max-w-[75ch] overflow-hidden backdrop-blur-lg" bind:this={descWrapperRef}>
		<p
			bind:this={descRef}
			class="font-satoshi text-secondary text-sm leading-tight"
			style="opacity: 0; transform: translateY(50px);"
		>
			I'm available for frontend roles or collaborations. Let's build something great.
		</p>
	</div>

	<!-- Info -->
	<div class="mt-4 w-fit overflow-hidden backdrop-blur-lg" bind:this={infoWrapperRef}>
		<div
			bind:this={infoRef}
			class="font-satoshi text-secondary flex flex-col items-end gap-1 text-sm"
			style="opacity: 0; transform: translateY(50px);"
		>
			<span>South Jakarta, Indonesia</span>
			<span>
				<a href="mailto:erickkbdn8120@gmail.com" class="hover:text-primary underline transition">
					erickkbdn8120@gmail.com
				</a>
			</span>
			<span>
				<a
					href="https://www.linkedin.com/in/tederick-budiono/"
					target="_blank"
					rel="noopener"
					class="hover:text-primary underline transition"
				>
					linkedin.com/in/tederick-budiono
				</a>
			</span>
		</div>
	</div>

	<!-- Button -->
	<div
		class="mt-4 w-fit overflow-hidden backdrop-blur-lg"
		bind:this={buttonWrapperRef}
		style="opacity: 0; transform: translateY(50px);"
	>
		<a
			href="mailto:erickkbdn8120@gmail.com"
			bind:this={buttonRef}
			class="button bg-secondary text-primary font-satoshi relative flex h-[2.5rem] items-center justify-center overflow-hidden rounded px-6 py-2 font-semibold transition"
		>
			<span class="relative block">
				<span class="block inline-block">Get in Touch</span>
			</span>
		</a>
	</div>
</section>
