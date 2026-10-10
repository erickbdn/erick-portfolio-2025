<script lang="ts">
	const education = [
		{
			label: 'Degree',
			value: 'Bachelor of Computer Science'
		},
		{
			label: 'University',
			value: 'BINUS University'
		},
		{
			label: 'Focus',
			value: 'Frontend engineering, interface systems, interaction design, and web foundations.'
		}
	];
</script>

<div class="font-satoshi mt-8 flex flex-col gap-6">
	<p class="text-secondary-80 max-w-[46ch] text-sm leading-tight">
		My academic foundation sits in computer science, with the portfolio leaning toward the parts I
		kept coming back to: designing interfaces, building them cleanly, and making interaction feel
		intentional.
	</p>

	<div class="grid gap-3">
		{#each education as item}
			<div class="border-secondary-30 grid grid-cols-[7rem_1fr] gap-4 border-t pt-3">
				<span class="text-secondary-60 text-xs uppercase">{item.label}</span>
				<span class="text-secondary text-sm leading-tight">{item.value}</span>
			</div>
		{/each}
	</div>
</div>
