import { listMovies, listSeries, listAnimes, VimeusError } from '$lib/server/vimeus';
import { toDisplay, type DisplayItem, type VimeusItem } from '$lib/vimeus';

export const load = async ({ locals }) => {
	let movies: DisplayItem[] = [];
	let series: DisplayItem[] = [];
	let animes: DisplayItem[] = [];
	let vimeusError: string | null = null;

	try {
		const [m, s, a] = await Promise.all([listMovies(1), listSeries(1), listAnimes(1)]);
		movies = m.items.slice(0, 24).map((item) => toDisplay(item));
		series = s.items.slice(0, 24).map((item) => toDisplay(item));
		animes = a.items.slice(0, 24).map((item) => toDisplay(item));
	} catch (e) {
		vimeusError = e instanceof VimeusError ? e.message : 'Error al conectar con Vimeus';
	}

	let continueWatching: DisplayItem[] = [];
	let favoriteKeys: string[] = [];
	if (locals.supabase) {
		const [cw, fav] = await Promise.all([
			locals.supabase
				.from('continue_watching')
				.select('*')
				.order('updated_at', { ascending: false })
				.limit(20),
			locals.supabase.from('favorites').select('content_type, tmdb_id')
		]);
		continueWatching = (cw.data ?? []).map((r) =>
			toDisplay(r as unknown as VimeusItem)
		);
		favoriteKeys = (fav.data ?? []).map((f) => `${f.content_type}:${f.tmdb_id}`);
	}

	return { movies, series, animes, continueWatching, favoriteKeys, vimeusError };
};