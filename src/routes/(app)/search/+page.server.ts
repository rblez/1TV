import { listMovies, listSeries, listAnimes, VimeusError } from '$lib/server/vimeus';
import { toDisplay, type DisplayItem } from '$lib/vimeus';

export const load = async () => {
	let movies: DisplayItem[] = [];
	let series: DisplayItem[] = [];
	let animes: DisplayItem[] = [];
	let vimeusError: string | null = null;
	try {
		const [m1, m2, s1, s2, a1, a2] = await Promise.all([
			listMovies(1),
			listMovies(2),
			listSeries(1),
			listSeries(2),
			listAnimes(1),
			listAnimes(2)
		]);
		movies = [...m1.items, ...m2.items].slice(0, 60).map((item) => toDisplay(item));
		series = [...s1.items, ...s2.items].slice(0, 60).map((item) => toDisplay(item));
		animes = [...a1.items, ...a2.items].slice(0, 60).map((item) => toDisplay(item));
	} catch (e) {
		vimeusError = e instanceof VimeusError ? e.message : 'Error al conectar con Vimeus';
	}
	return { movies, series, animes, vimeusError };
};