<script lang="ts">
	import { page } from '$app/state';
	import PosterCard from '$lib/components/PosterCard.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { FilmIcon, TvIcon, FireIcon, ChevronDownIcon } from '@hugeicons/core-free-icons';
	import type { DisplayItem, VimeusPagination } from '$lib/vimeus';

	let { data } = $props();

	let extra = $state<DisplayItem[]>([]);
	let pageNum = $state(1);
	let hasMore = $state(data.pagination?.has_next ?? false);
	let loading = $state(false);
	let loadError = $state<string | null>(null);
	const items = $derived([...data.items, ...extra]);

	const labels: Record<string, { title: string; icon: typeof FilmIcon }> = {
		movie: { title: 'Películas', icon: FilmIcon },
		series: { title: 'Series', icon: TvIcon },
		anime: { title: 'Animados', icon: FireIcon }
	};
	const label = $derived.by(() => labels[data.type] ?? labels.movie);

	async function loadMore() {
		if (!hasMore || loading) return;
		loading = true;
		loadError = null;
		try {
			const res = await fetch(`/api/vimeus/listing/${data.type}?page=${pageNum + 1}`);
			const body = await res.json();
			if (!res.ok) throw new Error(body.message ?? 'Error al cargar más contenido');
			extra = [...extra, ...body.items];
			pageNum += 1;
			hasMore = body.pagination?.has_next ?? false;
		} catch (e) {
			loadError = e instanceof Error ? e.message : 'Error al cargar más contenido';
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>{label.title} · 1TV</title>
</svelte:head>

<div class="px-4 py-8 sm:px-8">
	<div class="mb-6 flex items-center gap-2">
		<Icon icon={label.icon} size={22} class="text-neutral-500" />
		<h1 class="text-2xl font-bold tracking-tight">{label.title}</h1>
		<span class="font-mono text-xs text-neutral-600">
			{data.pagination ? `${items.length} de ${data.pagination.total_results}` : ''}
		</span>
	</div>

	{#if data.vimeusError}
		<div class="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
			{data.vimeusError}
		</div>
	{:else if items.length === 0}
		<div class="rounded-lg border border-neutral-800 bg-neutral-950 p-8 text-center text-sm text-neutral-500">
			No hay contenido disponible.
		</div>
	{:else}
		<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-6">
			{#each items as item (item.content_type + '-' + item.tmdb_id)}
				<PosterCard {item} size="w-full" showInfo={false} />
			{/each}
		</div>
	{/if}

	{#if loadError}
		<p class="mt-4 text-center text-sm text-red-400">{loadError}</p>
	{/if}

	{#if hasMore}
		<div class="mt-8 flex justify-center">
			<button
				onclick={loadMore}
				disabled={loading}
				class="flex items-center gap-2 rounded-full border border-neutral-800 px-6 py-3 text-sm font-medium text-neutral-300 transition hover:border-white hover:text-white disabled:opacity-50"
			>
				{loading ? 'Cargando…' : 'Cargar más'}
				<Icon icon={ChevronDownIcon} size={16} />
			</button>
		</div>
	{/if}
</div>