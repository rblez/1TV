import { error } from '@sveltejs/kit';
import { buildEmbedUrl, fetchAllEpisodes, VimeusError } from '$lib/server/vimeus';
import { parseTmdbParam, type DisplayItem, type VimeusContentType } from '$lib/vimeus';

const TYPES = ['movie', 'series', 'anime'] as const;

export const load = async ({ params, url }) => {
	const type = params.type as VimeusContentType;
	if (!TYPES.includes(type as (typeof TYPES)[number])) throw error(404, 'Tipo inválido');
	const tmdbId = parseTmdbParam(params.tmdb_id);
	if (!Number.isInteger(tmdbId) || tmdbId <= 0) throw error(404, 'Contenido no encontrado');

	const se = url.searchParams.get('se') ? Number(url.searchParams.get('se')) : null;
	const ep = url.searchParams.get('ep') ? Number(url.searchParams.get('ep')) : null;

	let embedUrl: string | null = null;
	let embedError: string | null = null;
	try {
		embedUrl = buildEmbedUrl(type, tmdbId, { se: se ?? undefined, ep: ep ?? undefined });
	} catch (e) {
		embedError = e instanceof VimeusError ? e.message : 'Error generando el reproductor';
	}

	let episodes: DisplayItem[] = [];
	let prev: DisplayItem | null = null;
	let next: DisplayItem | null = null;
	if (type !== 'movie') {
		try {
			episodes = await fetchAllEpisodes(tmdbId);
			const idx = episodes.findIndex((x) => x.season === se && x.episode === ep);
			if (idx > 0) prev = episodes[idx - 1];
			if (idx >= 0 && idx < episodes.length - 1) next = episodes[idx + 1];
		} catch {
			// el embed sigue funcionando sin la lista de episodios
		}
	}

	return { type, tmdbId, se, ep, embedUrl, embedError, episodes, prev, next };
};