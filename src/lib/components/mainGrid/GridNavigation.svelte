<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import gsap from 'gsap';
	import { gridNavigationHasSeenIntro } from '$lib/stores/intro';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { triggerExplosion, aboutActive } from '$lib/stores/transition';
	import { isNavigatingAway, targetRoute } from '$lib/stores/exitTransition';
	import { page } from '$app/stores';

	// Dynamic import and registration
	let MorphSVGPlugin: any = null;

	type NavLink = {
		href: string;
		label: string;
		number: string;
	};

	type NavState = {
		isOpen: boolean;
		isAnimating: boolean;
	};

	const NAV_LINKS: NavLink[] = [
		{ href: '/', label: 'Home', number: '01' },
		{ href: '/about', label: 'About', number: '02' },
		{ href: '/projects', label: 'Projects', number: '03' },
		{ href: '/skills', label: 'Skills', number: '04' }
	];

	let navState: NavState = {
		isOpen: true,
		isAnimating: false
	};

	let navItemRefs: HTMLLIElement[] = [];
	let buttonRef: HTMLButtonElement;
	let unsubscribe: () => void;

	// Initialize MorphSVGPlugin dynamically
	const initMorphSVGPlugin = async () => {
		try {
			const { MorphSVGPlugin: MorphSVG } = await import('gsap/MorphSVGPlugin');
			MorphSVGPlugin = MorphSVG;
			gsap.registerPlugin(MorphSVGPlugin);
			console.log('MorphSVGPlugin loaded successfully');
		} catch (error) {
			console.error('Failed to load MorphSVGPlugin:', error);
		}
	};

	// Updated morphing animation function with plugin check
	const animateIconMorph = (isOpening: boolean) => {
		if (!MorphSVGPlugin) {
			console.warn('MorphSVGPlugin not loaded, falling back to opacity transition');
			// Fallback to simple opacity transition
			const morphIcon = document.querySelector('#morph-icon');
			const closeReference = document.querySelector('#close-reference');

			if (isOpening) {
				gsap.to(morphIcon, { opacity: 0, duration: 0.3 });
				gsap.to(closeReference, { opacity: 1, duration: 0.3, delay: 0.3 });
			} else {
				gsap.to(closeReference, { opacity: 0, duration: 0.3 });
				gsap.to(morphIcon, { opacity: 1, duration: 0.3, delay: 0.3 });
			}
			return;
		}

		const morphIcon = document.querySelector('#morph-icon');
		const closeReference = document.querySelector('#close-reference');

		if (!morphIcon || !closeReference) return;

		if (isOpening) {
			gsap.to(morphIcon, {
				morphSVG: { shape: (closeReference as SVGPathElement).getAttribute('d') || '' },
				duration: 1,
				ease: 'back.out(2)'
			});
		} else {
			const hamburgerPath =
				'm404.1 185.3-54.7 18.2a57.4 57.4 0 0 1-27.1 2.4c5.1-7 12-13 20.9-17.5l51.5-25.8a57.7 57.7 0 1 0-77.4-77.4l-25.7 51.6a57.4 57.4 0 0 1-17.5 21 57.4 57.4 0 0 1 2.4-27.2l18.2-54.7a57.7 57.7 0 1 0-109.4 0l18.2 54.7a57.4 57.4 0 0 1 2.4 27.1 57.3 57.3 0 0 1-17.5-20.8l-25.8-51.6a57.7 57.7 0 1 0-77.4 77.4l51.6 25.7a57.4 57.4 0 0 1 21 17.5c-8.7 1.4-18 .7-27.2-2.4l-54.7-18.2a57.7 57.7 0 1 0 0 109.4l54.7-18.2a57.4 57.4 0 0 1 27.1-2.4 57.3 57.3 0 0 1-20.8 17.5l-51.6 25.8a57.7 57.7 0 1 0 77.4 77.4l25.7-51.6a57.4 57.4 0 0 1 17.5-21c1.4 8.7.7 18-2.4 27.2l-18.2 54.7a57.7 57.7 0 1 0 109.4 0l-18.2-54.7a57.4 57.4 0 0 1-2.4-27.1c7 5.1 13 12 17.5 20.9l25.8 51.5a57.7 57.7 0 1 0 77.4-77.4l-51.6-25.7a57.4 57.4 0 0 1-21-17.5c8.7-1.4 18-.7 27.2 2.4l54.7 18.2a57.7 57.7 0 1 0 0-109.4Z';

			gsap.to(morphIcon, {
				morphSVG: hamburgerPath,
				duration: 1,
				ease: 'back.out(2)'
			});
		}
	};

	// Rest of your functions remain the same
	const updateNavState = (updates: Partial<NavState>) => {
		navState = { ...navState, ...updates };
	};

	const setMenuOpen = (isOpen: boolean) => {
		updateNavState({ isOpen });
	};

	const setAnimating = (isAnimating: boolean) => {
		updateNavState({ isAnimating });
	};

	function handleNavClick(href: string) {
		const currentPath = get(page).url.pathname;

		if (href === currentPath || navState.isAnimating) {
			return;
		}

		if (href === '/about' && currentPath !== '/about') {
			aboutActive.set(true);
		} else if (currentPath === '/about' && href !== '/about') {
			aboutActive.set(false);
		}

		if (href === '/about' || currentPath === '/about') {
			isNavigatingAway.set(true);
			targetRoute.set(href);

			setTimeout(() => {
				goto(href);
				isNavigatingAway.set(false);
			}, 600);
		} else {
			isNavigatingAway.set(true);
			targetRoute.set(href);
			triggerExplosion.set(true);

			setTimeout(() => {
				goto(href);
				isNavigatingAway.set(false);
				triggerExplosion.set(false);
			}, 1200);
		}
	}

	async function toggleMenu(shouldOpen: boolean) {
		if (navState.isAnimating) return;

		animateIconMorph(shouldOpen);

		if (shouldOpen) {
			await openMenu();
		} else {
			closeMenu();
		}
	}

	async function openMenu() {
		setAnimating(true);
		setMenuOpen(true);

		await tick();

		const hasSeen = get(gridNavigationHasSeenIntro);
		const duration = hasSeen ? 0.1 : 1.5;
		const delay = hasSeen ? 0 : 2.2;

		animateNavItemsIn(duration, delay);
	}

	function closeMenu() {
		if (navState.isAnimating) return;

		const hasSeen = get(gridNavigationHasSeenIntro);
		const duration = hasSeen ? 0.2 : 1.2;
		const stagger = hasSeen ? 0.01 : 0.05;
		const delay = 0;

		animateNavItemsOut(duration, stagger, delay);
	}

	const animateNavItemsIn = (duration = 1.5, delay = 2.2) => {
		gsap.set(navItemRefs, { opacity: 0, y: 50 });
		setupEventListeners();
		const timeline = gsap.timeline({
			onComplete: () => {
				setAnimating(false);
			}
		});

		navItemRefs.forEach((element, index) => {
			timeline.fromTo(
				element,
				{ opacity: 0, y: 50 },
				{
					opacity: 1,
					y: 0,
					duration,
					ease: 'expo.out',
					delay: index * 0.1
				},
				delay
			);
		});
	};

	const animateButtonIn = (duration = 1.5, delay = 2.2) => {
		if (!buttonRef) return;

		gsap.set(buttonRef, { opacity: 0, scale: 0.8 });
		gsap.to(buttonRef, {
			opacity: 1,
			scale: 1,
			duration,
			ease: 'expo.out',
			delay
		});
	};

	const animateNavItemsOut = (duration = 1.2, stagger = 0.05, delay = 0) => {
		if (navState.isAnimating) return;

		setAnimating(true);

		const timeline = gsap.timeline({
			delay,
			onComplete: () => {
				setMenuOpen(false);
				setAnimating(false);
			}
		});

		timeline.to(navItemRefs, {
			opacity: 0,
			y: 50,
			duration,
			ease: 'circ.inOut',
			stagger
		});
	};

	const handleMouseEnter = (event: Event) => {
		const element = event.currentTarget as HTMLElement;
		const underlineEl = element.querySelector('.underline');
		if (underlineEl) {
			gsap.to(underlineEl, {
				scaleX: 1,
				transformOrigin: 'left',
				duration: 0.4,
				ease: 'expo.out'
			});
		}
	};

	const handleMouseLeave = (event: Event) => {
		const element = event.currentTarget as HTMLElement;
		const underlineEl = element.querySelector('.underline');
		if (underlineEl) {
			gsap.to(underlineEl, {
				scaleX: 0,
				transformOrigin: 'right',
				duration: 0.4,
				ease: 'expo.out'
			});
		}
	};

	const setupEventListeners = () => {
		navItemRefs.forEach((element) => {
			if (element) {
				element.addEventListener('mouseenter', handleMouseEnter);
				element.addEventListener('mouseleave', handleMouseLeave);
			}
		});
	};

	const cleanupEventListeners = () => {
		navItemRefs.forEach((element) => {
			if (element) {
				element.removeEventListener('mouseenter', handleMouseEnter);
				element.removeEventListener('mouseleave', handleMouseLeave);
			}
		});
	};

	onMount(async () => {
		// Initialize MorphSVGPlugin first
		await initMorphSVGPlugin();

		const hasSeen = get(gridNavigationHasSeenIntro);
		const duration = hasSeen ? 0.7 : 1.5;
		const delay = hasSeen ? 0.2 : 2.2;

		// Set initial icon state based on navigation state
		if (!hasSeen && navState.isOpen) {
			setInitialIconState(true); // Show close icon
		}

		animateButtonIn(duration, delay);
		animateNavItemsIn(duration, delay);
		gridNavigationHasSeenIntro.set(true);

		setupEventListeners();

		unsubscribe = isNavigatingAway.subscribe((navigating) => {
			if (navigating && navState.isOpen) {
				// When navigating away, close the menu AND update the icon to hamburger
				animateIconMorph(false); // Set icon to hamburger immediately
				animateNavItemsOut(1.2, 0.05, 0); // Don't update icon again in animateNavItemsOut
			}
		});
	});

	// Add this new function to set initial icon state
	const setInitialIconState = (showClose: boolean) => {
		if (!MorphSVGPlugin) {
			// Fallback for when MorphSVGPlugin isn't loaded
			const morphIcon = document.querySelector('#morph-icon');
			const closeReference = document.querySelector('#close-reference');

			if (showClose) {
				gsap.set(morphIcon, { opacity: 0 });
				gsap.set(closeReference, { opacity: 1 });
			} else {
				gsap.set(morphIcon, { opacity: 1 });
				gsap.set(closeReference, { opacity: 0 });
			}
			return;
		}

		const morphIcon = document.querySelector('#morph-icon');
		const closeReference = document.querySelector('#close-reference');

		if (!morphIcon || !closeReference) return;

		if (showClose) {
			// Instantly set to close icon shape
			gsap.set(morphIcon, {
				morphSVG: { shape: (closeReference as SVGPathElement).getAttribute('d') || '' }
			});
		}
		// If showClose is false, it's already in hamburger state by default
	};

	onDestroy(() => {
		cleanupEventListeners();
		navItemRefs.forEach((element) => {
			if (element) gsap.killTweensOf(element);
		});
		if (buttonRef) gsap.killTweensOf(buttonRef);
		if (unsubscribe) unsubscribe();
	});
</script>

<!-- Single Toggle Button -->
<button
	bind:this={buttonRef}
	class="text-secondary pointer-events-auto fixed top-4 right-4 z-20 ml-2 cursor-pointer px-2 py-2 hover:text-[var(--color-primary)]"
	on:click={() => toggleMenu(!navState.isOpen)}
	disabled={navState.isAnimating}
	aria-label={navState.isOpen ? 'Close menu' : 'Open menu'}
	style="opacity: 0; transform: scale(0.8);"
>
	<!-- Single SVG with both paths - only one visible at a time -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" class="block h-8 w-8">
		<!-- This will be the morphing path - starts as hamburger -->
		<path
			id="morph-icon"
			d="m404.1 185.3-54.7 18.2a57.4 57.4 0 0 1-27.1 2.4c5.1-7 12-13 20.9-17.5l51.5-25.8a57.7 57.7 0 1 0-77.4-77.4l-25.7 51.6a57.4 57.4 0 0 1-17.5 21 57.4 57.4 0 0 1 2.4-27.2l18.2-54.7a57.7 57.7 0 1 0-109.4 0l18.2 54.7a57.4 57.4 0 0 1 2.4 27.1 57.3 57.3 0 0 1-17.5-20.8l-25.8-51.6a57.7 57.7 0 1 0-77.4 77.4l51.6 25.7a57.4 57.4 0 0 1 21 17.5c-8.7 1.4-18 .7-27.2-2.4l-54.7-18.2a57.7 57.7 0 1 0 0 109.4l54.7-18.2a57.4 57.4 0 0 1 27.1-2.4 57.3 57.3 0 0 1-20.8 17.5l-51.6 25.8a57.7 57.7 0 1 0 77.4 77.4l25.7-51.6a57.4 57.4 0 0 1 17.5-21c1.4 8.7.7 18-2.4 27.2l-18.2 54.7a57.7 57.7 0 1 0 109.4 0l-18.2-54.7a57.4 57.4 0 0 1-2.4-27.1c7 5.1 13 12 17.5 20.9l25.8 51.5a57.7 57.7 0 1 0 77.4-77.4l-51.6-25.7a57.4 57.4 0 0 1-21-17.5c8.7-1.4 18-.7 27.2 2.4l54.7 18.2a57.7 57.7 0 1 0 0-109.4Z"
			fill="currentColor"
		/>
		<!-- Hidden reference path for the close icon (MorphSVGPlugin will use this as target) -->
		<path
			id="close-reference"
			d="M366.7 265.4c-27.7-5.6-27.7-45.2 0-50.7a85.2 85.2 0 0 0 43.6-143.8s-1.2-1.2-1.2-1.2a85.2 85.2 0 0 0-143.7 43.6c-5.6 27.7-45.2 27.7-50.7 0A85.2 85.2 0 0 0 70.9 69.7S69.7 71 69.7 71a85.2 85.2 0 0 0 43.6 143.8c27.7 5.5 27.7 45.1 0 50.7a85.2 85.2 0 0 0-42.4 144.9 85.2 85.2 0 0 0 143.8-43.6c5.5-27.7 45.1-27.7 50.7 0a85.2 85.2 0 0 0 144.9 42.4 85.2 85.2 0 0 0-43.6-143.8Z"
			fill="currentColor"
			style="opacity: 0; pointer-events: none;"
		/>
	</svg>
</button>

{#if navState.isOpen}
	<nav class="pointer-events-none" aria-label="Main navigation">
		<div class="flex items-start justify-end">
			<!-- Navigation Links -->
			<ul class="flex w-3/4 flex-col gap-0 pr-12">
				{#each NAV_LINKS as { href, label, number }, index}
					<li
						bind:this={navItemRefs[index]}
						class="w-full overflow-hidden backdrop-blur-lg"
						style="opacity: 0; transform: translateY(50px);"
					>
						<div class="w-full overflow-hidden">
							<a
								{href}
								class="group text-secondary font-satoshi pointer-events-auto relative flex w-full items-center justify-between overflow-hidden px-4 py-2 text-[1rem] font-medium hover:text-[var(--color-primary)]"
								on:click|preventDefault={() => handleNavClick(href)}
							>
								<span
									class="text-left transition-colors duration-400 group-hover:text-[var(--color-primary)]"
								>
									{number}
								</span>
								<span
									class="text-right transition-colors duration-400 group-hover:text-[var(--color-primary)]"
								>
									{label}
								</span>
								<span class="absolute inset-0 -z-10 h-full rounded-lg underline"></span>
							</a>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
{/if}

<style>
	.underline {
		content: '';
		position: absolute;
		bottom: 0.2rem;
		left: 0;
		width: 100%;
		background-color: var(--color-secondary);
		transform: scaleX(0);
		transform-origin: left;
	}
</style>
