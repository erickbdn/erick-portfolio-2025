<script>
    import GridIntro from '$lib/components/mainGrid/GridIntro.svelte'
    import GridNavigation from '$lib/components/mainGrid/GridNavigation.svelte'
    import GridProjects from '$lib/components/mainGrid/GridProjects.svelte'
    import GridCTA from '$lib/components/mainGrid/GridCTA.svelte'
    
    export let data; //this is from our page.server.ts
</script>

<div class="relative h-[100svh] p-4">
  <!-- Centered Three.js background -->
 
  <!-- The grid itself -->
  <div class="grid grid-cols-2 grid-rows-2 h-full gap-4 relative overflow-hidden">
    <GridIntro />
    <GridNavigation />
    <GridProjects projects={data.projectPreviews}/>
    <GridCTA />
  </div>
</div>