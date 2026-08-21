<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@hugeicons/core-free-icons';
	import { getSupabase } from '$lib/supabase';

	let { data } = $props();

	const t = $derived.by(() => page.url.searchParams.get('t') ?? '');
	const title = $derived(t || 'Reproduciendo');

	onMount(async () => {
		const sb = getSupabase();
		if (!sb) return;
		const {
			data: { user }
		} = await sb.auth.getUser();
		if (!user) return;
		await sb.from('continue_watching').upsert(
			{
				user_id: user.id,
				content_type: data.type,
				tmdb_id: data.tmdbId,
				imdb_id: null,
				title,
				season: data.se ?? 0,
				episode: data.ep ?? 0
			},
			{ onConflict: 'user_id,content_type,tmdb_id,season,episode' }
		);
	});

	function episodeHref(ep: { season?: number; episode?: number }) {
		const params = new URLSearchParams();
		params.set('se', String(ep.season ?? 1));
		params.set('ep', String(ep.episode ?? 1));
		params.set('t', title);
		params.set('p', page.url.searchParams.get('p') ?? '');
		return `/watch/${data.type}/${data.tmdbId}?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>{title} · 1TV</title>
</svelte:head>

<div class="px-4 py-6 sm:px-8">
	<div class="mb-5 flex flex-wrap items-center gap-4">
		<a
			href={`/title/${data.type}/${data.tmdbId}?t=${encodeURIComponent(title)}&p=${encodeURIComponent(page.url.searchParams.get('p') ?? '')}`}
			class="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition hover:border-white hover:text-white"
			title="Volver a detalles"
		>
			<Icon icon={ArrowLeftIcon} size={18} />
		</a>
		<div>
			<h1 class="text-lg font-semibold tracking-tight">{title}</h1>
			{#if data.type !== 'movie' && data.se !== null && data.ep !== null}
				<p class="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
					Temporada {data.se} · Episodio {data.ep}
				</p>
			{/if}
		</div>
		<div class="ml-auto flex items-center gap-2">
			{#if data.prev}
				<a
					href={episodeHref(data.prev)}
					class="flex items-center gap-1.5 rounded-full border border-neutral-800 px-4 py-2 text-sm text-neutral-300 transition hover:border-white hover:text-white"
				>
					<Icon icon={ChevronLeftIcon} size={16} /> Anterior
				</a>
			{/if}
			{#if data.next}
				<a
					href={episodeHref(data.next)}
					class="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-300"
				>
					Siguiente <Icon icon={ChevronRightIcon} size={16} />
				</a>
			{/if}
		</div>
	</div>

	{#if data.embedError}
		<div class="rounded-lg border border-neutral-800 bg-neutral-950 p-8 text-center text-sm text-neutral-400">
			{data.embedError}
		</div>
	{:else if data.embedUrl}
		<div class="aspect-video w-full overflow-hidden rounded-xl border border-neutral-900 bg-black">
			<iframe
				src={data.embedUrl}
				title={title}
				class="h-full w-full"
				allowfullscreen
				allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
				referrerpolicy="origin"
			></iframe>
		</div>
	{:else}
		<div class="rounded-lg border border-neutral-800 bg-neutral-950 p-8 text-center text-sm text-neutral-500">
			No se pudo cargar el reproductor.
		</div>
	{/if}
</div>