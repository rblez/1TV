<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';
	import {
		PlayIcon,
		ChevronDownIcon,
		ArrowLeftIcon,
		FilmIcon,
		TvIcon,
		FireIcon
	} from '@hugeicons/core-free-icons';
	import { imgUrl } from '$lib/vimeus';

	let { data } = $props();

	const typeLabels: Record<string, { label: string; icon: typeof FilmIcon }> = {
		movie: { label: 'Película', icon: FilmIcon },
		series: { label: 'Serie', icon: TvIcon },
		anime: { label: 'Animados', icon: FireIcon }
	};
	const typeLabel = $derived.by(() => typeLabels[data.type] ?? typeLabels.movie);

	const t = $derived.by(
		() => page.url.searchParams.get('t') ?? data.first?.title ?? 'Título sin nombre'
	);
	const p = $derived.by(() => page.url.searchParams.get('p') ?? data.first?.poster ?? '');
	const backdrop = $derived.by(() => data.first?.backdrop_url ?? imgUrl(p) ?? null);
	const title = $derived(t || 'Título sin nombre');
	const item = $derived({
		id: 0,
		content_type: data.type,
		tmdb_id: data.tmdbId,
		imdb_id: data.first?.imdb_id ?? null,
		title,
		poster: p || null,
		poster_url: imgUrl(p),
		backdrop: (data.first?.backdrop ?? p) || null,
		backdrop_url: backdrop
	});

	const totalEpisodes = $derived(
		data.seasons.reduce((acc, s) => acc + s.episodes.length, 0)
	);

	function episodeHref(season: number, episode: number) {
		return `/watch/${data.type}/${data.tmdbId}?se=${season}&ep=${episode}&t=${encodeURIComponent(title)}&p=${encodeURIComponent(p)}`;
	}

	const playHref = $derived(
		data.type === 'movie'
			? `/watch/${data.type}/${data.tmdbId}?t=${encodeURIComponent(title)}&p=${encodeURIComponent(p)}`
			: data.seasons[0]?.episodes[0]
				? episodeHref(data.seasons[0].season, data.seasons[0].episodes[0].episode ?? 1)
				: ''
	);
</script>

<svelte:head>
	<title>{title} · 1TV</title>
</svelte:head>

{#if backdrop}
	<section class="relative h-72 overflow-hidden sm:h-96">
		<img src={backdrop} alt={title} class="absolute inset-0 h-full w-full object-cover" />
		<div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30"></div>
	</section>
{/if}

<div class="mx-auto max-w-5xl px-4 sm:px-8 {backdrop ? '-mt-28 relative z-10' : 'pt-8'}">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="max-w-2xl">
			<p class="mb-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
				<Icon icon={typeLabel.icon} size={14} />
				{typeLabel.label}
				{#if data.seasons.length > 0}
					· {data.seasons.length} temporada{data.seasons.length > 1 ? 's' : ''} · {totalEpisodes} episodios
				{/if}
			</p>
			<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
		</div>
		<div class="flex items-center gap-3">
			<a
				href="/"
				class="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition hover:border-white hover:text-white"
				title="Volver"
			>
				<Icon icon={ArrowLeftIcon} size={18} />
			</a>
			<FavoriteButton {item} initial={data.isFavorite} />
		</div>
	</div>

	{#if data.vimeusError}
		<div class="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
			{data.vimeusError}
		</div>
	{/if}

	<div class="mt-8">
		{#if data.type === 'movie'}
			<a
				href={playHref}
				class="flex w-fit items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-black transition hover:bg-neutral-300"
			>
				<Icon icon={PlayIcon} size={18} /> Reproducir
			</a>
		{:else if data.seasons.length > 0}
			{#each data.seasons as season (season.season)}
				<details class="group border-b border-neutral-900">
					<summary
						class="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold text-neutral-300 transition hover:text-white"
					>
						<span>Temporada {season.season} · {season.episodes.length} episodios</span>
						<Icon
							icon={ChevronDownIcon}
							size={18}
							class="transition group-open:rotate-180"
						/>
					</summary>
					<div class="grid grid-cols-1 gap-2 pb-5 sm:grid-cols-2">
						{#each season.episodes as ep (ep.episode)}
							<a
								href={episodeHref(season.season, ep.episode ?? 0)}
								class="flex items-center gap-3 rounded-lg border border-neutral-900 px-4 py-3 text-sm transition hover:border-white hover:bg-neutral-950"
							>
								<span class="font-mono text-xs text-neutral-600">
									E{String(ep.episode ?? 0).padStart(2, '0')}
								</span>
								<span class="truncate text-neutral-300">{ep.title}</span>
								<Icon icon={PlayIcon} size={14} class="ml-auto shrink-0 text-neutral-600" />
							</a>
						{/each}
					</div>
				</details>
			{/each}
		{:else}
			<div class="rounded-lg border border-neutral-800 bg-neutral-950 p-8 text-center text-sm text-neutral-500">
				No hay episodios disponibles para este título.
			</div>
		{/if}
	</div>
</div>