<script lang="ts">
	import Icon from './Icon.svelte';
	import { PlayIcon, ClapperboardIcon } from '@hugeicons/core-free-icons';
	import { titleHref } from '$lib/vimeus';
	import type { DisplayItem } from '$lib/vimeus';

	let {
		item,
		href,
		size = 'w-40 sm:w-44',
		showInfo = true
	}: {
		item: DisplayItem;
		href?: string;
		size?: string;
		showInfo?: boolean;
	} = $props();

	const defaultHref = $derived(titleHref(item.content_type, item.tmdb_id, item.title));
	const link = $derived(href ?? defaultHref);
</script>

<a href={link} class="group flex flex-col shrink-0 {size}">
	<div
		class="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 transition group-hover:border-white"
	>
		{#if item.poster_url}
			<img src={item.poster_url} alt={item.title} loading="lazy" decoding="async" fetchpriority="low" width="342" height="513" class="block h-full w-full object-cover" />
		{:else}
			<div class="flex h-full w-full items-center justify-center text-neutral-600">
				<Icon icon={ClapperboardIcon} size={40} />
			</div>
		{/if}
		<div
			class="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 opacity-0 transition group-hover:opacity-100"
		>
			<div class="flex flex-col items-center gap-2">
				<span class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
					<Icon icon={PlayIcon} size={18} />
				</span>
				<span class="line-clamp-2 text-center text-xs font-medium text-white">{item.title}</span>
			</div>
		</div>
	</div>
	{#if showInfo}
		<p class="mt-2 line-clamp-1 text-xs text-neutral-400">{item.title}</p>
	{/if}
</a>