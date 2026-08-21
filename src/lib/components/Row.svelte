<script lang="ts">
	import PosterCard from './PosterCard.svelte';
	import Icon from './Icon.svelte';
	import type { IconSvg } from '$lib/icons';
	import type { DisplayItem } from '$lib/vimeus';

	let {
		title,
		icon,
		items,
		href
	}: {
		title: string;
		icon?: IconSvg;
		items: DisplayItem[];
		href?: string;
	} = $props();
</script>

<section class="px-4 sm:px-8">
	<div class="mb-4 flex items-center gap-2">
		{#if icon}<Icon icon={icon} size={18} class="text-neutral-500" />{/if}
		{#if href}
			<a href={href} class="text-lg font-semibold tracking-tight transition hover:text-neutral-400">
				{title}
			</a>
		{:else}
			<h2 class="text-lg font-semibold tracking-tight">{title}</h2>
		{/if}
	</div>
	<div class="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
		{#each items as item (item.content_type + '-' + item.tmdb_id)}
			<div class="snap-start shrink-0"><PosterCard {item} /></div>
		{/each}
	</div>
</section>