<script lang="ts">
	import PosterCard from '$lib/components/PosterCard.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { Search01Icon, CancelIcon } from '@hugeicons/core-free-icons';

	let { data } = $props();

	let query = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;

	function onInput(e: Event) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			query = (e.target as HTMLInputElement).value.trim().toLowerCase();
		}, 250);
	}

	const q = $derived(query);
	const filter = (items: typeof data.movies) =>
		items.filter((i) => i.title.toLowerCase().includes(q));

	const results = $derived({
		movie: filter(data.movies),
		series: filter(data.series),
		anime: filter(data.animes)
	});
	const total = $derived(results.movie.length + results.series.length + results.anime.length);
</script>

<svelte:head>
	<title>Buscar · 1TV</title>
</svelte:head>

<div class="px-4 py-8 sm:px-8">
	<div class="mx-auto mb-8 max-w-xl">
		<label
			class="flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-950 px-5 py-3.5 transition focus-within:border-white"
		>
			<Icon icon={Search01Icon} size={20} class="text-neutral-500" />
			<input
				type="search"
				placeholder="Buscar en el catálogo…"
				oninput={onInput}
				value={query}
				class="w-full bg-transparent text-sm outline-none placeholder:text-neutral-600"
			/>
		</label>
	</div>

	{#if data.vimeusError}
		<div class="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
			{data.vimeusError}
		</div>
	{:else if !q}
		<p class="text-center text-sm text-neutral-600">Escribe para filtrar el catálogo (primeras 100 entradas por tipo).</p>
	{:else if total === 0}
		<div class="flex flex-col items-center gap-3 py-12 text-neutral-600">
			<Icon icon={CancelIcon} size={32} />
			<p class="text-sm">Sin resultados para «{q}».</p>
		</div>
	{:else}
		<div class="flex flex-col gap-10">
			{#if results.movie.length > 0}
				<section>
					<h2 class="mb-4 text-lg font-semibold tracking-tight">Películas</h2>
					<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-6">
						{#each results.movie as item (item.tmdb_id)}
							<PosterCard {item} size="w-full" showInfo={false} />
						{/each}
					</div>
				</section>
			{/if}
			{#if results.series.length > 0}
				<section>
					<h2 class="mb-4 text-lg font-semibold tracking-tight">Series</h2>
					<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-6">
						{#each results.series as item (item.tmdb_id)}
							<PosterCard {item} size="w-full" showInfo={false} />
						{/each}
					</div>
				</section>
			{/if}
			{#if results.anime.length > 0}
				<section>
					<h2 class="mb-4 text-lg font-semibold tracking-tight">Animados</h2>
					<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-6">
						{#each results.anime as item (item.tmdb_id)}
							<PosterCard {item} size="w-full" showInfo={false} />
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>