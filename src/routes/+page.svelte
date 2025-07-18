<script>
    import GridIntro from '$lib/components/mainGrid/GridIntro.svelte'
    import GridNavigation from '$lib/components/mainGrid/GridNavigation.svelte'
    import GridProjects from '$lib/components/mainGrid/GridProjects.svelte'
    import GridCTA from '$lib/components/mainGrid/GridCTA.svelte'
    import ThreeBackground from '$lib/components/Three/ThreeBackground.svelte';
    
    export let data; //this is from our page.server.ts
</script>

<div class="relative h-[100svh] bg-[var(--color-primary)] p-4">
  <!-- Centered Three.js background -->
  <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
    <ThreeBackground />
     <!-- <PatternBackground/> -->
  </div>
  <!-- The grid itself -->
  <div class="grid grid-cols-2 grid-rows-2 h-full gap-4 relative z-10 overflow-hidden">
    <GridIntro />
    <GridNavigation />
    <GridProjects projects={data.projectPreviews}/>
    <GridCTA />
  </div>
</div>