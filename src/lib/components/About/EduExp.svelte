<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { gsap } from 'gsap';
	import { isNavigatingAway } from '$lib/stores/exitTransition';

	// Static imports for section components
	import Education from './sections/EducationSection.svelte';
	import Experience from './sections/ExperienceSection.svelte';
	import Resume from './sections/ResumeSection.svelte';

	let cardEls: HTMLButtonElement[] = [];
	let sectionEl: HTMLDivElement;
	let timeline: gsap.core.Timeline;
	let unsubscribe: () => void;
	let activeSection: string | null = null;

	// Map ID to component
	const sectionComponents: Record<string, typeof Education> = {
		education: Education,
		experience: Experience,
		resume: Resume
	};

	const items = [
		{ labelStart: 'EDU', labelEnd: 'CATION', img: '/image/BINUS.jpg', id: 'education' },
		{ labelStart: 'EX', labelEnd: 'PERIENCE', img: '/image/NIKOLA.png', id: 'experience' },
		{ labelStart: 'RESU', labelEnd: 'ME', img: '/image/spirals.png', id: 'resume' }
	];

	async function handleClick(id: string) {
		await gsap.to(cardEls, {
			opacity: 0,
			y: 50,
			duration: 0.2,
			ease: 'circ.in',
			stagger: 0.15
		});
		activeSection = id;
		await tick();
		gsap.from(sectionEl, { y: 50, opacity: 0, duration: 0.6, ease: 'expo.out' });
	}

	async function goBack() {
		if (sectionEl) {
			await gsap.to(sectionEl, {
				y: 50,
				opacity: 0,
				duration: 0.4,
				ease: 'circ.in'
			});
		}
		activeSection = null;
		await tick();
		gsap.fromTo(
			cardEls,
			{ opacity: 0, y: 50 },
			{ opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.15 }
		);
	}

	onMount(() => {
		gsap.set(cardEls, { opacity: 0, y: 50 });
		timeline = gsap.timeline({ defaults: { ease: 'expo.out', duration: 3.2 } });
		timeline.to(cardEls, { opacity: 1, y: 0, stagger: 0.3 });

		unsubscribe = isNavigatingAway.subscribe(async (val) => {
			if (!val) return;
			if (activeSection && sectionEl) {
				await gsap.to(sectionEl, {
					y: 50,
					opacity: 0,
					duration: 0.45,
					ease: 'circ.inOut'
				});
				gsap.set(cardEls, { opacity: 0, y: 50, pointerEvents: 'none' });
				activeSection = null;
				await tick();
				gsap.set(cardEls, { pointerEvents: '' });
			} else {
				gsap.to(cardEls, {
					opacity: 0,
					y: 50,
					duration: 1.0,
					ease: 'circ.inOut'
				});
			}
		});
	});

	onDestroy(() => {
		timeline?.kill();
		cardEls.forEach((el) => gsap.killTweensOf(el));
		unsubscribe?.();
	});
</script>

<!-- rest of your component remains identical -->

<section class="flex h-full w-full flex-col justify-end gap-2 overflow-hidden">
	{#if !activeSection}
		{#each items as item, i}
			<button
				bind:this={cardEls[i]}
				on:click={() => handleClick(item.id)}
				class="cursor-pointer overflow-hidden select-none"
			>
				<h2
					class="font-satoshi text-secondary flex items-center text-[3rem] leading-none font-black"
				>
					<span>{item.labelStart}</span>
					<span class="mx-2 h-[2.2rem] w-[3rem] overflow-hidden rounded-xs">
						<img src={item.img} alt="" class="h-full w-full object-cover" />
					</span>
					<span>{item.labelEnd}</span>
				</h2>
			</button>
		{/each}
	{:else}
		<div bind:this={sectionEl} class="text-secondary flex h-full w-full flex-col p-4">
			<div class="flex items-start justify-between">
				<h2 class="text-4xl font-bold capitalize">{activeSection}</h2>
				<button
					on:click={goBack}
					class="text-secondary bg-secondary-5 mr-40 rounded-full px-4 py-2 font-bold backdrop-blur-xl hover:cursor-pointer"
				>
					Back
				</button>
			</div>

			<!-- Render correct component -->
			<svelte:component this={sectionComponents[activeSection]} />
		</div>
	{/if}
</section>
