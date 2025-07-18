<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import gsap from 'gsap';

  type NavLink = {
    href: string;
    label: string;
    number: string;
  };

  const NAV_LINKS: NavLink[] = [
    { href: '/', label: 'Home', number: '01' },
    { href: '/about', label: 'About', number: '02' },
    { href: '/projects', label: 'Projects', number: '03' },
    { href: '/skills', label: 'Skills', number: '04' },
    { href: '/certificates', label: 'Certificates', number: '05' }
  ];

  let navItemRefs: HTMLLIElement[] = [];

  const animateNavItemsIn = () => {
    gsap.set(navItemRefs, { opacity: 0, y: 50 }); // FOUC protection
    navItemRefs.forEach((element, index) => {
      gsap.fromTo(
        element,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'expo.out',
          delay: 2.2 + index * 0.2
        }
      );
    });
  };

  const handleMouseEnter = (event: Event) => {
    const element = event.currentTarget as HTMLElement;
    gsap.to(element.querySelector('.underline'), {
      scaleX: 1,
      transformOrigin: 'left',
      duration: 0.4,
      ease: 'expo.out'
    });
  };

  const handleMouseLeave = (event: Event) => {
    const element = event.currentTarget as HTMLElement;
    gsap.to(element.querySelector('.underline'), {
      scaleX: 0,
      transformOrigin: 'right',
      duration: 0.4,
      ease: 'expo.out'
    });
  };

  const setupEventListeners = () => {
    navItemRefs.forEach((element) => {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    });
  };

  const cleanupEventListeners = () => {
    navItemRefs.forEach((element) => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    });
  };

  onMount(() => {
    animateNavItemsIn();
    setupEventListeners();
  });

  onDestroy(() => {
    cleanupEventListeners();
    navItemRefs.forEach((element) => {
      if (element) gsap.killTweensOf(element);
    });
  });
</script>

<nav class="pl-[12rem]" aria-label="Main navigation">
  <ul class="flex flex-col gap-0">
    {#each NAV_LINKS as { href, label, number }, index}
      <li
        bind:this={navItemRefs[index]}
        class="w-full overflow-hidden backdrop-blur-lg"
        style="opacity: 0; transform: translateY(50px);"
      >
        <div class="w-full overflow-hidden">
          <a
            {href}
            class="group text-secondary font-satoshi relative flex w-full items-center justify-between overflow-hidden px-4 py-2 text-[1rem] font-medium hover:text-[var(--color-primary)]"
          >
            <span class="text-left transition-colors duration-400 group-hover:text-[var(--color-primary)]">
              {number}
            </span>
            <span class="text-right transition-colors duration-400 group-hover:text-[var(--color-primary)]">
              {label}
            </span>

            <span class="underline absolute inset-0 -z-10 h-full rounded-lg"></span>
          </a>
        </div>
      </li>
    {/each}
  </ul>
</nav>

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
