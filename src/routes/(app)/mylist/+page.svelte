<script lang="ts">
	import PosterCard from '$lib/components/PosterCard.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { HeartIcon } from '@hugeicons/core-free-icons';

	let { data } = $props();
	const { items } = $derived(data);
</script>

<svelte:head>
	<title>Mi lista · 1TV</title>
</svelte:head>

<div class="px-4 py-8 sm:px-8">
	<div class="mb-6 flex items-center gap-2">
		<Icon icon={HeartIcon} size={22} class="text-neutral-500" />
		<h1 class="text-2xl font-bold tracking-tight">Mi lista</h1>
		<span class="font-mono text-xs text-neutral-600">{items.length}</span>
	</div>

	{#if items.length === 0}
		<div class="rounded-lg border border-neutral-800 bg-neutral-950 p-12 text-center">
			<Icon icon={HeartIcon} size={36} class="mx-auto mb-3 text-neutral-700" />
			<p class="text-sm text-neutral-500">
				Aún no agregas contenido. Toca el corazón en cualquier título para guardarlo aquí.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-6">
			{#each items as item (item.content_type + '-' + item.tmdb_id)}
				<PosterCard {item} size="w-full" showInfo={false} />
			{/each}
		</div>
	{/if}
</div>