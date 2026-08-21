import { error } from '@sveltejs/kit';
import { fetchAllEpisodes, VimeusError } from '$lib/server/vimeus';
import { groupBySeason, parseTmdbParam, type DisplayItem, type VimeusContentType } from '$lib/vimeus';

const TYPES = ['movie', 'series', 'anime'] as const;

export const load = async ({ params, locals }) => {
	const type = params.type as VimeusContentType;
	if (!TYPES.includes(type as (typeof TYPES)[number])) throw error(404, 'Tipo inválido');
	const tmdbId = parseTmdbParam(params.tmdb_id);
	if (!Number.isInteger(tmdbId) || tmdbId <= 0) throw error(404, 'Contenido no encontrado');

	let episodes: DisplayItem[] = [];
	let vimeusError: string | null = null;
	if (type !== 'movie') {
		try {
			episodes = await fetchAllEpisodes(tmdbId);
		} catch (e) {
			vimeusError = e instanceof VimeusError ? e.message : 'Error al cargar episodios';
		}
	}
	const seasons = groupBySeason(episodes);
	const first = episodes[0] ?? null;

	let isFavorite = false;
	if (locals.supabase) {
		const { data } = await locals.supabase
			.from('favorites')
			.select('id')
			.eq('content_type', type)
			.eq('tmdb_id', tmdbId)
			.maybeSingle();
		isFavorite = Boolean(data);
	}

	return { type, tmdbId, seasons, first, isFavorite, vimeusError };
};