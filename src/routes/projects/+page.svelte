<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { gsap } from 'gsap';
	import { isNavigatingAway } from '$lib/stores/exitTransition';

	type ProjectImage = {
		asset?: {
			url?: string;
			metadata?: { dimensions?: { width: number; height: number } };
		};
	};

	type Project = {
		_id: string;
		title: string;
		slug: string;
		summary?: string;
		description?: string;
		technologies?: string[];
		images?: ProjectImage[];
	};

	export let data: { projects?: Project[] };

	let headerRef: HTMLElement;
	let visualRef: HTMLElement;
	let detailRef: HTMLElement;
	let railRef: HTMLElement;
	let titleRef: HTMLHeadingElement;
	let copyRef: HTMLParagraphElement;
	let metaRef: HTMLDivElement;
	let unsubscribe: () => void;
	let timeline: gsap.core.Timeline;

	let activeProjectIndex = 0;
	let activeImageIndex = 0;

	$: projects = data.projects ?? [];
	$: currentProject = projects[activeProjectIndex];
	$: currentImages = currentProject?.images?.filter((image) => image?.asset?.url) ?? [];
	$: currentImage = currentImages[activeImageIndex];
	$: activeDescription =
		currentProject?.description || currentProject?.summary || 'Project notes are being shaped.';

	function clampProjectIndex(index: number) {
		if (!projects.length) return 0;
		return (index + projects.length) % projects.length;
	}

	function clampImageIndex(index: number) {
		if (!currentImages.length) return 0;
		return (index + currentImages.length) % currentImages.length;
	}

	async function revealActiveContent(direction: 'next' | 'prev' | 'project' = 'next') {
		await tick();

		const fromClip =
			direction === 'prev'
				? 'inset(0% 0% 0% 100%)'
				: direction === 'project'
					? 'inset(100% 0% 0% 0%)'
					: 'inset(0% 100% 0% 0%)';

		if (visualRef) {
			gsap.killTweensOf(visualRef);
			gsap.fromTo(
				visualRef,
				{ clipPath: fromClip, opacity: 0.5, scale: 1.02 },
				{
					clipPath: 'inset(0% 0% 0% 0%)',
					opacity: 1,
					scale: 1,
					duration: 1,
					ease: 'expo.out'
				}
			);
		}

		const textTargets = [titleRef, copyRef, metaRef].filter(Boolean);
		gsap.killTweensOf(textTargets);
		gsap.fromTo(
			textTargets,
			{ opacity: 0, y: 24 },
			{ opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 }
		);
	}

	function selectProject(index: number) {
		if (!projects.length || index === activeProjectIndex) return;
		activeProjectIndex = clampProjectIndex(index);
		activeImageIndex = 0;
		revealActiveContent('project');
	}

	function nextProject() {
		selectProject(activeProjectIndex + 1);
	}

	function prevProject() {
		selectProject(activeProjectIndex - 1);
	}

	function nextImage() {
		if (currentImages.length < 2) return;
		activeImageIndex = clampImageIndex(activeImageIndex + 1);
		revealActiveContent('next');
	}

	function prevImage() {
		if (currentImages.length < 2) return;
		activeImageIndex = clampImageIndex(activeImageIndex - 1);
		revealActiveContent('prev');
	}

	onMount(() => {
		const targets = [headerRef, visualRef, detailRef, railRef].filter(Boolean);
		gsap.set(targets, { opacity: 0, y: 48 });

		timeline = gsap.timeline({ defaults: { duration: 1.1, ease: 'expo.out' } });
		timeline.to(targets, { opacity: 1, y: 0, stagger: 0.12, delay: 0.2 });

		unsubscribe = isNavigatingAway.subscribe((val) => {
			if (!val) return;
			gsap.to(targets, {
				opacity: 0,
				y: 48,
				duration: 1,
				ease: 'circ.inOut',
				stagger: 0.05
			});
		});
	});

	onDestroy(() => {
		timeline?.kill();
		gsap.killTweensOf([headerRef, visualRef, detailRef, railRef, titleRef, copyRef, metaRef]);
		unsubscribe?.();
	});
</script>

<svelte:head>
	<title>Projects | Kire.dev</title>
</svelte:head>

<div class="projects-page relative h-[100svh] overflow-hidden p-4">
	<div class="active-project-mark font-alpino" aria-hidden="true">
		{String(activeProjectIndex + 1).padStart(2, '0')}
	</div>

	<section class="text-secondary relative z-10 flex h-full flex-col overflow-hidden">
		<header bind:this={headerRef} class="flex items-start justify-between gap-8 pr-24">
			<div class="backdrop-blur-lg">
				<p class="font-satoshi text-secondary-60 text-xs font-bold uppercase">Selected work</p>
				<h1 class="font-alpino text-secondary text-[6rem] leading-none font-black">PROJECTS</h1>
			</div>

			{#if projects.length}
				<div class="font-satoshi text-secondary mt-4 text-sm font-bold backdrop-blur-lg">
					{String(activeProjectIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(
						2,
						'0'
					)}
				</div>
			{/if}
		</header>

		{#if currentProject}
			<div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] gap-4 pt-4">
				<div class="flex min-h-0 flex-col gap-4">
					<figure
						bind:this={visualRef}
						class="project-visual border-secondary-15 bg-primary-15 relative min-h-0 flex-1 overflow-hidden border backdrop-blur-lg"
					>
						{#if currentImage?.asset?.url}
							<img
								src={currentImage.asset.url}
								alt={currentProject.title}
								class="h-full w-full object-cover"
							/>
						{:else}
							<div
								class="font-satoshi text-secondary-80 flex h-full w-full items-center justify-center p-8 text-center text-sm"
							>
								Preview image coming soon.
							</div>
						{/if}

						<div class="font-satoshi absolute bottom-4 left-4 flex gap-2 text-xs font-bold">
							<button
								on:click={prevImage}
								class="project-control border-secondary-30 text-secondary hover:bg-secondary hover:text-primary border px-3 py-2 backdrop-blur-lg transition disabled:opacity-40"
								disabled={currentImages.length < 2}
							>
								Prev image
							</button>
							<button
								on:click={nextImage}
								class="project-control border-secondary-30 text-secondary hover:bg-secondary hover:text-primary border px-3 py-2 backdrop-blur-lg transition disabled:opacity-40"
								disabled={currentImages.length < 2}
							>
								Image ->
							</button>
						</div>
					</figure>

					<div bind:this={railRef} class="font-satoshi grid grid-cols-2 gap-2 md:grid-cols-4">
						{#each projects as project, i}
							<button
								on:click={() => selectProject(i)}
								class="project-tab group hover:bg-secondary hover:text-primary flex min-h-[4rem] items-end justify-between gap-3 border px-3 py-2 text-left text-sm font-bold backdrop-blur-lg transition"
								class:border-secondary={activeProjectIndex === i}
								class:border-secondary-15={activeProjectIndex !== i}
								class:bg-secondary={activeProjectIndex === i}
								class:text-primary={activeProjectIndex === i}
								class:text-secondary={activeProjectIndex !== i}
							>
								<span>{String(i + 1).padStart(2, '0')}</span>
								<span class="max-w-[12rem] truncate">{project.title}</span>
							</button>
						{/each}
					</div>
				</div>

				<aside
					bind:this={detailRef}
					class="project-detail flex min-h-0 flex-col justify-between gap-6 border border-secondary-15 p-4 backdrop-blur-lg"
				>
					<div class="flex flex-col gap-5">
						<div
							bind:this={metaRef}
							class="font-satoshi text-secondary-60 flex items-center justify-between gap-4 text-xs font-bold uppercase"
						>
							<span>{currentProject.slug}</span>
							<span
								>{String(activeImageIndex + 1).padStart(2, '0')} / {String(
									Math.max(currentImages.length, 1)
								).padStart(2, '0')}</span
							>
						</div>

						<h2
							bind:this={titleRef}
							class="font-satoshi text-secondary text-5xl leading-none font-black"
						>
							{currentProject.title}
						</h2>

						<p
							bind:this={copyRef}
							class="font-satoshi text-secondary-80 max-w-[56ch] text-sm leading-tight"
						>
							{activeDescription}
						</p>

						{#if currentProject.technologies?.length}
							<ul class="font-satoshi flex flex-wrap gap-2">
								{#each currentProject.technologies as technology}
									<li
										class="border-secondary-30 text-secondary rounded-sm border px-3 py-2 text-xs font-bold uppercase"
									>
										{technology}
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div class="font-satoshi flex justify-between gap-3 text-sm font-bold">
						<button
							on:click={prevProject}
							class="project-control border-secondary-30 text-secondary hover:bg-secondary hover:text-primary border px-4 py-2 transition"
						>
							Prev
						</button>
						<button
							on:click={nextProject}
							class="project-control bg-secondary text-primary hover:bg-secondary-80 px-4 py-2 transition"
						>
							Next ->
						</button>
					</div>
				</aside>
			</div>
		{:else}
			<div
				bind:this={detailRef}
				class="font-satoshi text-secondary flex flex-1 items-end justify-start pb-8"
			>
				<p class="max-w-[36ch] text-sm leading-tight backdrop-blur-lg">
					No projects are published yet. Add project documents in Sanity and they will appear here.
				</p>
			</div>
		{/if}
	</section>
</div>

<style>
	.projects-page::before {
		content: '';
		position: absolute;
		inset: 1rem;
		pointer-events: none;
		background:
			linear-gradient(90deg, rgba(244, 241, 222, 0.09) 1px, transparent 1px) 0 0 / 5rem 5rem,
			linear-gradient(0deg, rgba(244, 241, 222, 0.07) 1px, transparent 1px) 0 0 / 5rem 5rem;
		mask-image: radial-gradient(circle at 35% 45%, black, transparent 68%);
	}

	.active-project-mark {
		position: absolute;
		left: 48%;
		top: 48%;
		z-index: 1;
		pointer-events: none;
		transform: translate(-50%, -50%);
		color: rgba(244, 241, 222, 0.1);
		font-size: clamp(11rem, 32vw, 28rem);
		font-weight: 900;
		line-height: 0.75;
	}

	.project-visual {
		clip-path: polygon(0 0, calc(100% - 2rem) 0, 100% 2rem, 100% 100%, 2rem 100%, 0 calc(100% - 2rem));
	}

	.project-visual::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			linear-gradient(120deg, transparent 0 62%, rgba(244, 241, 222, 0.18) 62.2%, transparent 62.8%),
			linear-gradient(0deg, rgba(224, 122, 95, 0.12), transparent 42%);
		mix-blend-mode: screen;
	}

	.project-detail {
		clip-path: polygon(0 0, calc(100% - 1.25rem) 0, 100% 1.25rem, 100% 100%, 0 100%);
		background: rgba(224, 122, 95, 0.04);
	}

	.project-control,
	.project-tab {
		clip-path: polygon(0.65rem 0, 100% 0, calc(100% - 0.65rem) 100%, 0 100%);
	}

	.project-tab {
		transform-origin: bottom right;
	}

	.project-tab:hover {
		transform: translateY(-0.2rem) rotate(-0.4deg);
	}
</style>
