import { error } from '@sveltejs/kit';
import { listMovies, listSeries, listAnimes, VimeusError } from '$lib/server/vimeus';
import { toDisplay, type VimeusContentType, type VimeusPagination } from '$lib/vimeus';

const TYPES = ['movie', 'series', 'anime'] as const;

export const load = async ({ params }) => {
	const type = params.type as VimeusContentType;
	if (!TYPES.includes(type as (typeof TYPES)[number])) throw error(404, 'Tipo inválido');

	let items: ReturnType<typeof toDisplay>[] = [];
	let pagination: VimeusPagination | null = null;
	let vimeusError: string | null = null;
	try {
		const res =
			type === 'movie' ? await listMovies(1) : type === 'series' ? await listSeries(1) : await listAnimes(1);
		items = res.items.map((item) => toDisplay(item));
		pagination = res.pagination;
	} catch (e) {
		vimeusError = e instanceof VimeusError ? e.message : 'Error al conectar con Vimeus';
	}
	return { type, items, pagination, vimeusError };
};