<script lang="ts">
	import { FilmIcon, TvIcon, FireIcon, ClockIcon, PlayIcon, InformationCircleIcon } from '@hugeicons/core-free-icons';
	import Row from '$lib/components/Row.svelte';
	import PosterCard from '$lib/components/PosterCard.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { titleHref, watchHref } from '$lib/vimeus';

	let { data } = $props();
	const { movies, series, animes, continueWatching, vimeusError } = $derived(data);
	const hero = $derived(movies[0]);
</script>

{#if vimeusError}
	<div class="mx-4 my-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400 sm:mx-8">
		<strong class="text-white">Vimeus no está conectado.</strong> {vimeusError}
	</div>
{/if}

{#if hero && hero.backdrop_url}
	<section class="relative flex min-h-[60vh] items-end overflow-hidden">
		<img src={hero.backdrop_url} alt={hero.title} class="absolute inset-0 h-full w-full object-cover" />
		<div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20"></div>
		<div class="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 sm:px-8">
			<p class="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-neutral-400">
				Película destacada
			</p>
			<h1 class="mb-5 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">{hero.title}</h1>
			<div class="flex flex-wrap gap-3">
				<a
					href={watchHref(hero.content_type, hero.tmdb_id, hero.title)}
					class="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-neutral-300"
				>
					<Icon icon={PlayIcon} size={18} /> Reproducir
				</a>
				<a
					href={titleHref(hero.content_type, hero.tmdb_id, hero.title)}
					class="flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
				>
					<Icon icon={InformationCircleIcon} size={18} /> Detalles
				</a>
			</div>
		</div>
	</section>
{/if}

<div class="mt-10 flex flex-col gap-12">
	{#if continueWatching.length > 0}
		<section class="px-4 sm:px-8">
			<div class="mb-4 flex items-center gap-2">
				<Icon icon={ClockIcon} size={18} class="text-neutral-500" />
				<h2 class="text-lg font-semibold tracking-tight">Continuar viendo</h2>
			</div>
			<div class="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
				{#each continueWatching as item (item.content_type + '-' + item.tmdb_id + '-' + item.season + '-' + item.episode)}
					<div class="snap-start shrink-0">
						<PosterCard
							item={item}
							href={watchHref(item.content_type, item.tmdb_id, item.title, { se: item.season ?? undefined, ep: item.episode ?? undefined })}
						/>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if movies.length > 0}
		<Row title="Películas" icon={FilmIcon} items={movies} href="/browse/movie" />
	{/if}
	{#if series.length > 0}
		<Row title="Series" icon={TvIcon} items={series} href="/browse/series" />
	{/if}
	{#if animes.length > 0}
		<Row title="Animados" icon={FireIcon} items={animes} href="/browse/anime" />
	{/if}
</div>