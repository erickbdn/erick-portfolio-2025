<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { gridProjectsHasSeenIntro } from '$lib/stores/intro';
	import { get } from 'svelte/store';
	import { isNavigatingAway } from '$lib/stores/exitTransition';
	import { onDestroy } from 'svelte';

	export let projects: Array<{
		_id: string;
		title: string;
		slug: string;
		summary: string;
		images: Array<{
			asset: {
				url: string;
				metadata: { dimensions: { width: number; height: number } };
			};
		}>;
	}>;

	let activeIndex = 0;
	let activeImageIndex = 0;

	let imageRef: HTMLImageElement;
	let textRef: HTMLDivElement;
	let metaRef: HTMLDivElement;

	let headingRef: HTMLHeadingElement;
	let tabListRef: HTMLDivElement;
	let sectionRef: HTMLDivElement | null = null;

	let previousTabIndex = 0;
	let previousImageIndex = 0;
	let transitionDirection: 'next' | 'prev' | 'tab' = 'next';

	let initialReveal = true;

	$: currentProject = projects[activeIndex];
	$: totalImages = currentProject?.images?.length || 0;

	let unsubscribe: () => void;

	function prevImage() {
		transitionDirection = 'prev';
		activeImageIndex = (activeImageIndex - 1 + totalImages) % totalImages;
	}

	function nextImage() {
		transitionDirection = 'next';
		activeImageIndex = (activeImageIndex + 1) % totalImages;
	}

	function switchTab(i: number) {
		transitionDirection = 'tab';
		activeIndex = i;
		activeImageIndex = 0;
	}

	$: if (imageRef && totalImages > 0 && currentProject) {
		const isTab = transitionDirection === 'tab';
		const isInitial = initialReveal;
		const fromClip = isTab
			? 'inset(100% 0% 0% 0%)'
			: transitionDirection === 'next'
				? 'inset(0% 100% 0% 0%)'
				: 'inset(0% 0% 0% 100%)';

		gsap.killTweensOf(imageRef);

		gsap.set(imageRef, {
			clipPath: fromClip,
			opacity: 0,
		});

		gsap.to(imageRef, {
			clipPath: 'inset(0% 0% 0% 0%)',
			scale: 1,
			opacity: 1,
			duration: 1.5,
			ease: 'expo.out',
			delay: isInitial ? 2.2 : 0.4,
		});

		if (isTab || isInitial) {
			gsap.killTweensOf([metaRef, textRef]);
			gsap.set([metaRef, textRef], { opacity: 0, y: 100 });

			gsap.to([textRef, metaRef], {
				opacity: 1,
				y: 0,
				duration: 1.5,
				ease: 'expo.out',
				stagger: 0.2,
				delay: isInitial ? 2.4 : 0.2,
				onStart: () => {
					// Remove blur class to make sure it’s not applied during hidden state
					metaRef.classList.remove('backdrop-blur-lg');
					textRef.classList.remove('backdrop-blur-lg');
				},
				onComplete: () => {
					metaRef.classList.add('backdrop-blur-lg');
					textRef.classList.add('backdrop-blur-lg');
				}
			});
		}

		previousTabIndex = activeIndex;
		previousImageIndex = activeImageIndex;
		if (initialReveal) initialReveal = false;
	}

	onMount(() => {
		const hasSeen = get(gridProjectsHasSeenIntro);

		if (hasSeen) {
			gsap.set(headingRef, { yPercent: 100, opacity: 0 });
			gsap.set(Array.from(tabListRef.children), { yPercent: 100, opacity: 0 });
			gsap.set([metaRef, textRef], { opacity: 0, y: 40 });

			const duration = 0.7;
			const delay = 0.2;
			const tl = gsap.timeline();
			tl.to(headingRef, {
				yPercent: 0,
				opacity: 1,
				duration,
				ease: 'expo.out',
				delay
			})
			.to(Array.from(tabListRef.children), {
				yPercent: 0,
				opacity: 1,
				duration,
				ease: 'expo.out',
				stagger: 0.2,
				delay
			}, 0)
			.to([metaRef, textRef], {
				opacity: 1,
				y: 0,
				duration,
				ease: 'expo.out',
				stagger: 0.2,
				onStart: () => {
					metaRef.classList.remove('backdrop-blur-lg');
					textRef.classList.remove('backdrop-blur-lg');
				},
				onComplete: () => {
					metaRef.classList.add('backdrop-blur-lg');
					textRef.classList.add('backdrop-blur-lg');
				}
			}, '-=0.4');
			initialReveal = false;
		} else {
			gsap.set(headingRef, { yPercent: 100, opacity: 0 });
			gsap.set(Array.from(tabListRef.children), { yPercent: 100, opacity: 0 });
			gsap.set([metaRef, textRef], { opacity: 0, y: 40 });

			const tl = gsap.timeline();

			tl.to(headingRef, {
				yPercent: 0,
				opacity: 1,
				duration: 1.5,
				ease: 'expo.out',
				delay: 2.2
			})
			.to(Array.from(tabListRef.children), {
				yPercent: 0,
				opacity: 1,
				duration: 1.5,
				ease: 'expo.out',
				stagger: 0.2,
				delay: 2.2
			}, 0)
			.to([metaRef, textRef], {
				opacity: 1,
				y: 0,
				duration: 1.5,
				ease: 'expo.out',
				stagger: 0.2,
				onStart: () => {
					metaRef.classList.remove('backdrop-blur-lg');
					textRef.classList.remove('backdrop-blur-lg');
				},
				onComplete: () => {
					metaRef.classList.add('backdrop-blur-lg');
					textRef.classList.add('backdrop-blur-lg');
				}
			}, "-=1.2")
		}
		gridProjectsHasSeenIntro.set(true);

		unsubscribe = isNavigatingAway.subscribe((val) => {
			if (val) {
				gsap.to(headingRef, {
					yPercent: 100,
					opacity: 0,
					duration: 1.2,
					ease: 'circ.inOut'
				});
				if (tabListRef) {
					gsap.to(Array.from(tabListRef.children), {
						yPercent: 100,
						opacity: 0,
						duration: 1.2,
						ease: 'circ.inOut',
						stagger: 0.05
					});
				}
				gsap.to([metaRef, textRef], {
					opacity: 0,
					y: 50,
					duration: 1.2,
					ease: 'circ.inOut',
					stagger: 0.05
				});
				if (imageRef) {
					gsap.to(imageRef, {
						opacity: 0,
						duration: 1.2,
						ease: 'circ.inOut'
					});
				}
			}
		});
	});

	onDestroy(() => {
		gsap.killTweensOf([headingRef, metaRef, textRef, imageRef]);
		if (tabListRef) {
			Array.from(tabListRef.children).forEach((el) => gsap.killTweensOf(el));
		}
		if (unsubscribe) unsubscribe();
	});
</script>

<section class="flex h-full w-full flex-col overflow-hidden" bind:this={sectionRef as HTMLDivElement}>
	<!-- Header -->
	<header class="overflow-hidden">
		<h1
			bind:this={headingRef}
			class="mb-2 text-[2.5rem] font-bold text-secondary font-satoshi"
			style="opacity: 0;"
		>
			Projects
		</h1>
	</header>

	<!-- Navigation -->
	<nav bind:this={tabListRef as HTMLDivElement} class="flex gap-2 overflow-hidden pt-2 pb-2" aria-label="Project navigation">
		{#each projects as project, i}
			<div class="overflow-hidden pb-2" style="opacity: 0">
				<button
					on:click={() => switchTab(i)}
					class="block rounded-sm px-8 py-2 text-sm font-medium font-satoshi backdrop-blur-lg transition-all duration-200
					hover:cursor-pointer hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)]"
					class:bg-[var(--color-secondary)]={activeIndex === i}
					class:text-[var(--color-primary)]={activeIndex === i}
					class:bg-transparent={activeIndex !== i}
					class:text-[var(--color-secondary)]={activeIndex !== i}
				>
					{project.title}
				</button>
			</div>
		{/each}
	</nav>

	<!-- Main Display -->
	<article class="flex min-h-0 flex-grow flex-col justify-end">
		<div class="flex max-h-full w-full items-stretch gap-4 overflow-hidden">

			<!-- Image -->
			<figure class="relative flex aspect-[4/3] w-1/2 items-center justify-center overflow-hidden rounded-sm">
				{#if totalImages > 0}
					<img
						bind:this={imageRef}
						src={currentProject.images[activeImageIndex].asset.url}
						alt={currentProject.title}
						class="h-full w-full object-cover"
						style="clip-path: inset(0% 0% 0% 0%); opacity: 0;"
					/>
				{/if}
			</figure>

			<!-- Meta Info -->
			<aside class="h-fit rounded-lg overflow-hidden">
				<div
					class="flex flex-col items-start justify-center gap-4"
					bind:this={metaRef}
					style="opacity: 0;"
				>
					<div class=" p-2">
						<span class="text-sm font-medium text-secondary font-satoshi">
							{String(activeImageIndex + 1).padStart(2, '0')} / {String(totalImages).padStart(2, '0')}
						</span>
						{#if totalImages > 1}
							<div class="mt-2 flex flex-col gap-2 text-sm text-secondary">
								<button on:click={prevImage} class="transition hover:cursor-pointer hover:opacity-80">← Prev</button>
								<button on:click={nextImage} class="transition hover:cursor-pointer hover:opacity-80">Next →</button>
							</div>
						{/if}
					</div>
				</div>
			</aside>

			<!-- Text -->
			<aside class="w-1/3 h-fit rounded-lg overflow-hidden">
				<div
					class="text-sm text-secondary font-satoshi p-2"
					bind:this={textRef}
					style="opacity: 0;"
				>
					<p>{currentProject.summary}</p>
				</div>
			</aside>
		</div>
	</article>
</section>
