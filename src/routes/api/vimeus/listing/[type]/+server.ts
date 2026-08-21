import { json } from '@sveltejs/kit';
import { listMovies, listSeries, listAnimes, VimeusError } from '$lib/server/vimeus';
import { toDisplay } from '$lib/vimeus';

export async function GET({ params, url, locals }) {
	if (!locals.session) return json({ message: 'No autorizado' }, { status: 401 });
	const type = params.type;
	if (!['movie', 'series', 'anime'].includes(type)) {
		return json({ message: 'Tipo inválido' }, { status: 400 });
	}
	const page = Number(url.searchParams.get('page') ?? '1');
	if (!Number.isInteger(page) || page < 1) {
		return json({ message: 'Página inválida' }, { status: 400 });
	}
	try {
		const res =
			type === 'movie' ? await listMovies(page) : type === 'series' ? await listSeries(page) : await listAnimes(page);
		return json({ items: res.items.map((item) => toDisplay(item)), pagination: res.pagination }, {
			headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' }
		});
	} catch (e) {
		if (e instanceof VimeusError) return json({ message: e.message }, { status: 502 });
		return json({ message: 'Error interno' }, { status: 500 });
	}
}