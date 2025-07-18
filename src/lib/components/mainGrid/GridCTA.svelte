<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';

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

	onMount(() => {
		// Set initial state immediately to avoid FOUC
		gsap.set([titleRef, descRef, infoRef, buttonWrapperRef], { opacity: 0, y: 50 });

		const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } });

		tl.to(titleRef, { opacity: 1, y: 0, delay: 2.2 })
		  .to(descRef, { opacity: 1, y: 0, delay: 0.2 }, "-=1")
		  .to(infoRef, { opacity: 1, y: 0, delay: 0.2 }, "-=1")
		  .to(buttonWrapperRef, { opacity: 1, y: 0, delay: 0.2 }, "-=1");

		// Hover effect for button text
		const span = buttonRef.querySelector("span span") as HTMLSpanElement;
		if (span) {
			hoverTimeline = gsap.timeline({ paused: true });
			hoverTimeline.to(span, { duration: 0.2, yPercent: -150, ease: "power2.in" });
			hoverTimeline.set(span, { yPercent: 150 });
			hoverTimeline.to(span, { duration: 0.2, yPercent: 0 });

			hoverHandler = () => hoverTimeline && hoverTimeline.play(0);
			buttonRef.addEventListener("mouseenter", hoverHandler);
		}
	});

	onDestroy(() => {
		gsap.killTweensOf([titleRef, descRef, infoRef, buttonWrapperRef]);

		if (hoverTimeline) {
			hoverTimeline.kill();
			hoverTimeline = null;
		}

		if (buttonRef && hoverHandler) {
			buttonRef.removeEventListener("mouseenter", hoverHandler);
			hoverHandler = null;
		}
	});
</script>

<section class="flex flex-col justify-end h-full p-6 items-end text-right relative">
	<!-- Title -->
	<div class="overflow-hidden w-fit backdrop-blur-lg" bind:this={titleWrapperRef}>
		<h2
			bind:this={titleRef}
			class="text-3xl font-black font-satoshi text-secondary"
			style="opacity: 0; transform: translateY(50px);"
		>
			Let’s work together!
		</h2>
	</div>

	<!-- Description -->
	<div class="overflow-hidden w-fit max-w-[75ch] mt-2 backdrop-blur-lg" bind:this={descWrapperRef}>
		<p
			bind:this={descRef}
			class="text-sm font-satoshi text-secondary leading-tight"
			style="opacity: 0; transform: translateY(50px);"
		>
			I’m available for frontend roles or collaborations—let’s build something great.
		</p>
	</div>

	<!-- Info -->
	<div class="overflow-hidden w-fit mt-4 backdrop-blur-lg" bind:this={infoWrapperRef}>
		<div
			bind:this={infoRef}
			class="flex flex-col items-end gap-1 text-sm font-satoshi text-secondary"
			style="opacity: 0; transform: translateY(50px);"
		>
			<span>South Jakarta, Indonesia</span>
			<span>
				<a href="mailto:erickkbdn8120@gmail.com" class="underline hover:text-primary transition">
					erickkbdn8120@gmail.com
				</a>
			</span>
			<span>
				<a
					href="https://www.linkedin.com/in/tederick-budiono/"
					target="_blank"
					rel="noopener"
					class="underline hover:text-primary transition"
				>
					linkedin.com/in/tederick-budiono
				</a>
			</span>
		</div>
	</div>

	<!-- Button -->
	<div
		class="overflow-hidden w-fit mt-4 backdrop-blur-lg"
		bind:this={buttonWrapperRef}
		style="opacity: 0; transform: translateY(50px);"
	>
		<a
			href="mailto:erickkbdn8120@gmail.com"
			bind:this={buttonRef}
			class="button flex items-center justify-center bg-secondary text-primary px-6 py-2 rounded font-satoshi font-semibold transition overflow-hidden relative h-[2.5rem]"
		>
			<span class="block relative">
				<span class="inline-block block">Get in Touch</span>
			</span>
		</a>
	</div>
</section>
