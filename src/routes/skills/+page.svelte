<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { gsap } from 'gsap';
	import { particleTarget } from '$lib/stores/transition';
	import { isNavigatingAway } from '$lib/stores/exitTransition';

	type Skill = {
		label: string;
		particleText: string;
		category: string;
		summary: string;
		details: string[];
	};

	const skills: Skill[] = [
		{
			label: 'SvelteKit',
			particleText: 'SVELTE',
			category: 'Framework',
			summary: 'Route-led apps, server data, and components that stay easy to move.',
			details: ['routing', 'load functions', 'stores', 'component flow']
		},
		{
			label: 'TypeScript',
			particleText: 'TYPES',
			category: 'Language',
			summary: 'Props, CMS data, and UI states with fewer browser-time surprises.',
			details: ['typed props', 'data models', 'async states', 'utility types']
		},
		{
			label: 'Tailwind',
			particleText: 'TAILWIND',
			category: 'Styling',
			summary: 'Fast layout work with enough constraint to keep spacing consistent.',
			details: ['responsive grids', 'tokens', 'states', 'composition']
		},
		{
			label: 'GSAP',
			particleText: 'GSAP',
			category: 'Motion',
			summary: 'Timing, transitions, reveals, and tactile feedback without fighting CSS.',
			details: ['timelines', 'easing', 'reveals', 'micro-motion']
		},
		{
			label: 'Three.js',
			particleText: 'THREE',
			category: 'WebGL',
			summary: 'Particles, shader-driven texture shapes, and pointer-reactive scenes.',
			details: ['buffers', 'shaders', 'particles', 'interaction']
		},
		{
			label: 'Sanity',
			particleText: 'SANITY',
			category: 'CMS',
			summary: 'Structured project content instead of hard-coded portfolio fragments.',
			details: ['schemas', 'GROQ', 'images', 'editable content']
		},
		{
			label: 'UI Design',
			particleText: 'DESIGN',
			category: 'Craft',
			summary: 'Hierarchy, rhythm, states, and the small details that make UI feel handled.',
			details: ['layout', 'hierarchy', 'states', 'polish']
		},
		{
			label: 'Responsive CSS',
			particleText: 'CSS',
			category: 'Frontend',
			summary: 'Layouts that survive tight, wide, awkward, and very real viewports.',
			details: ['grid', 'flex', 'constraints', 'stable sizing']
		},
		{
			label: 'Animation',
			particleText: 'MOTION',
			category: 'Interaction',
			summary: 'Motion that orients the visitor instead of just decorating the screen.',
			details: ['continuity', 'feedback', 'timing', 'reduced shift']
		}
	];

	const categories = Array.from(new Set(skills.map((skill) => skill.category)));

	let activeSkill = skills[0];
	let pageRef: HTMLElement;
	let headerRef: HTMLElement;
	let controlsRef: HTMLElement;
	let detailRef: HTMLElement;
	let tickerRef: HTMLElement;
	let categoryRefs: HTMLSpanElement[] = [];
	let skillButtonRefs: HTMLButtonElement[] = [];
	let unsubscribe: () => void;
	let timeline: gsap.core.Timeline;

	async function selectSkill(skill: Skill) {
		if (activeSkill === skill) return;

		activeSkill = skill;
		particleTarget.set({ type: 'text', text: skill.particleText });

		await tick();
		gsap.fromTo(
			detailRef,
			{ opacity: 0, y: 28, rotate: -0.4 },
			{ opacity: 1, y: 0, rotate: 0, duration: 0.7, ease: 'expo.out' }
		);
	}

	onMount(() => {
		particleTarget.set({ type: 'text', text: activeSkill.particleText });

		const targets = [headerRef, controlsRef, detailRef, tickerRef].filter(Boolean);
		gsap.set(targets, { opacity: 0, y: 48 });
		gsap.set([...skillButtonRefs, ...categoryRefs], { opacity: 0, y: 32 });

		timeline = gsap.timeline({ defaults: { duration: 1, ease: 'expo.out' } });
		timeline
			.to(targets, { opacity: 1, y: 0, stagger: 0.1, delay: 0.2 })
			.to(categoryRefs, { opacity: 1, y: 0, stagger: 0.05 }, '-=0.7')
			.to(skillButtonRefs, { opacity: 1, y: 0, stagger: 0.04 }, '-=0.55');

		unsubscribe = isNavigatingAway.subscribe((val) => {
			if (!val) return;
			gsap.to([headerRef, controlsRef, detailRef, tickerRef, ...skillButtonRefs, ...categoryRefs], {
				opacity: 0,
				y: 48,
				duration: 1,
				ease: 'circ.inOut',
				stagger: 0.03
			});
		});
	});

	onDestroy(() => {
		timeline?.kill();
		gsap.killTweensOf([
			headerRef,
			controlsRef,
			detailRef,
			tickerRef,
			...skillButtonRefs,
			...categoryRefs
		]);
		unsubscribe?.();
	});
</script>

<svelte:head>
	<title>Skills | Kire.dev</title>
</svelte:head>

<div bind:this={pageRef} class="skills-page relative h-[100svh] overflow-hidden p-4">
	<section
		class="text-secondary relative z-10 grid h-full grid-cols-[minmax(0,1fr)_minmax(22rem,0.64fr)] grid-rows-[auto_1fr_auto] gap-4"
	>
		<header bind:this={headerRef} class="self-start pr-24">
			<div class="w-fit backdrop-blur-lg">
				<p class="font-satoshi text-secondary-60 text-xs font-black uppercase">Skill signal</p>
				<h1 class="font-alpino text-secondary text-[6rem] leading-none font-black">SKILLS</h1>
			</div>

			<div class="mt-4 flex max-w-[38rem] flex-wrap gap-2">
				{#each categories as category, i}
					<span
						bind:this={categoryRefs[i]}
						class="chip border-secondary-30 text-secondary font-satoshi rounded-sm border px-3 py-2 text-[0.68rem] font-black uppercase backdrop-blur-lg"
						style="opacity: 0"
					>
						{category}
					</span>
				{/each}
			</div>
		</header>

		<nav
			bind:this={controlsRef}
			class="font-satoshi row-span-3 flex flex-col items-end justify-center gap-2 pr-12"
			aria-label="Skill selection"
		>
			{#each skills as skill, i}
				<button
					bind:this={skillButtonRefs[i]}
					on:click={() => selectSkill(skill)}
					class="skill-button group grid w-full max-w-[26rem] grid-cols-[3.5rem_1fr_auto] items-center gap-4 border px-4 py-3 text-left backdrop-blur-lg transition duration-300 hover:-translate-x-3 hover:bg-secondary hover:text-primary"
					class:border-secondary={activeSkill === skill}
					class:border-secondary-15={activeSkill !== skill}
					class:bg-secondary={activeSkill === skill}
					class:text-primary={activeSkill === skill}
					class:text-secondary={activeSkill !== skill}
					style="opacity: 0"
				>
					<span class="text-xs font-black">{String(i + 1).padStart(2, '0')}</span>
					<span>
						<span class="block text-sm font-black uppercase">{skill.label}</span>
						<span class="block text-xs font-medium opacity-70">{skill.category}</span>
					</span>
					<span class="signal-dot h-2 w-2 rounded-full bg-current opacity-60"></span>
				</button>
			{/each}
		</nav>

		<article bind:this={detailRef} class="font-satoshi self-end pb-3 backdrop-blur-lg">
			<div class="skill-panel border-secondary-30 max-w-[39rem] border p-4">
				<div class="mb-5 flex items-center justify-between gap-4">
					<p class="text-secondary-60 text-xs font-black uppercase">Selected discipline</p>
					<p class="text-secondary-60 text-xs font-black uppercase">
						{String(skills.indexOf(activeSkill) + 1).padStart(2, '0')}
					</p>
				</div>

				<p class="text-secondary-60 mb-2 text-xs font-bold uppercase">{activeSkill.category}</p>
				<h2 class="text-secondary text-5xl leading-none font-black">{activeSkill.label}</h2>
				<p class="text-secondary-80 mt-4 max-w-[48ch] text-sm leading-tight">
					{activeSkill.summary}
				</p>

				<ul class="mt-6 grid grid-cols-2 gap-2">
					{#each activeSkill.details as detail}
						<li
							class="border-secondary-30 text-secondary rounded-sm border px-3 py-2 text-xs font-black uppercase"
						>
							{detail}
						</li>
					{/each}
				</ul>
			</div>
		</article>

		<div bind:this={tickerRef} class="ticker col-span-1 self-end overflow-hidden backdrop-blur-lg">
			<div class="ticker-track font-satoshi text-secondary text-xs font-black uppercase">
				<span>Particle type only</span>
				<span>Click a signal</span>
				<span>No fallback word</span>
				<span>{activeSkill.category}</span>
				<span>{activeSkill.label}</span>
				<span>Particle type only</span>
				<span>Click a signal</span>
				<span>No fallback word</span>
				<span>{activeSkill.category}</span>
				<span>{activeSkill.label}</span>
			</div>
		</div>
	</section>
</div>

<style>
	.skills-page::before {
		content: '';
		position: absolute;
		inset: 1rem;
		pointer-events: none;
		background:
			linear-gradient(90deg, rgba(244, 241, 222, 0.1) 1px, transparent 1px) 0 0 / 4rem 4rem,
			linear-gradient(0deg, rgba(244, 241, 222, 0.08) 1px, transparent 1px) 0 0 / 4rem 4rem;
		mask-image: linear-gradient(90deg, black, transparent 72%);
	}

	.chip {
		clip-path: polygon(0.55rem 0, 100% 0, calc(100% - 0.55rem) 100%, 0 100%);
	}

	.skill-panel {
		clip-path: polygon(0 0, calc(100% - 1.3rem) 0, 100% 1.3rem, 100% 100%, 0 100%);
		background:
			linear-gradient(135deg, rgba(244, 241, 222, 0.18) 0 1px, transparent 1px 22px) 0 0 /
				22px 22px,
			rgba(224, 122, 95, 0.04);
		box-shadow: 0 0 0 1px rgba(244, 241, 222, 0.06) inset;
	}

	.skill-button {
		clip-path: polygon(0 0, calc(100% - 0.95rem) 0, 100% 50%, calc(100% - 0.95rem) 100%, 0 100%);
		transform-origin: center right;
	}

	.skill-button:hover .signal-dot,
	.skill-button.bg-secondary .signal-dot {
		opacity: 1;
	}

	.ticker {
		border-top: 1px solid rgba(244, 241, 222, 0.25);
		border-bottom: 1px solid rgba(244, 241, 222, 0.25);
	}

	.ticker-track {
		display: flex;
		width: max-content;
		gap: 2rem;
		padding: 0.65rem 0;
		animation: ticker 18s linear infinite;
	}

	@keyframes ticker {
		to {
			transform: translateX(-50%);
		}
	}
</style>
