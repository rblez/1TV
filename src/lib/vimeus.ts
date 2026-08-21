export const VIMEUS_BASE = 'https://vimeus.com';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

export type VimeusContentType = 'movie' | 'series' | 'anime';

export interface VimeusItem {
	id?: number;
	content_type?: VimeusContentType;
	tmdb_id: number;
	imdb_id: string | null;
	title: string;
	poster: string | null;
	backdrop: string | null;
	total_seasons?: number;
	total_episodes?: number;
	season?: number;
	episode?: number;
	synced_at?: string;
	embed_url?: string | null;
	download_url?: string | null;
	quality?: string | null;
}

export interface VimeusPagination {
	current_page: number;
	total_pages: number;
	total_results: number;
	per_page: number;
	has_next: boolean;
	has_prev: boolean;
}

export interface VimeusListing<T> {
	items: T[];
	pagination: VimeusPagination | null;
}

export interface DisplayItem {
	id: number;
	content_type: VimeusContentType;
	tmdb_id: number;
	imdb_id: string | null;
	title: string;
	poster: string | null;
	poster_url: string | null;
	backdrop: string | null;
	backdrop_url: string | null;
	total_seasons?: number;
	total_episodes?: number;
	season?: number;
	episode?: number;
	embed_url?: string | null;
}

export function imgUrl(
	path: string | null | undefined,
	width = 342
): string | null {
	if (!path) return null;
	const raw = `${TMDB_IMAGE_BASE}${path}`;
	// wsrv redimensiona + convierte a webp en un solo hop (HEAD 200 verificado)
	return `https://wsrv.nl/?url=${encodeURIComponent(raw)}&w=${width}&output=webp`;
}

export function toDisplay(item: VimeusItem, inferredType?: VimeusContentType): DisplayItem {
	return {
		id: item.id ?? item.tmdb_id,
		content_type: item.content_type ?? inferredType ?? 'movie',
		tmdb_id: item.tmdb_id,
		imdb_id: item.imdb_id,
		title: item.title,
		poster: item.poster,
		poster_url: imgUrl(item.poster, 342),
		backdrop: item.backdrop,
		backdrop_url: imgUrl(item.backdrop, 780),
		total_seasons: item.total_seasons,
		total_episodes: item.total_episodes,
		season: item.season,
		episode: item.episode,
		embed_url: (item as { embed_url?: string | null }).embed_url ?? null
	};
}

export interface SeasonGroup {
	season: number;
	episodes: DisplayItem[];
}

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 60);
}

export function parseTmdbParam(param: string): number {
	const id = Number(param.split('-')[0]);
	return id;
}

export function titleHref(type: VimeusContentType, tmdbId: number, title: string): string {
	return `/title/${type}/${tmdbId}-${slugify(title)}`;
}

export function watchHref(
	type: VimeusContentType,
	tmdbId: number,
	title: string,
	opts: { se?: number; ep?: number } = {}
): string {
	const base = `/watch/${type}/${tmdbId}-${slugify(title)}`;
	const qs = new URLSearchParams();
	if (opts.se !== undefined) qs.set('se', String(opts.se));
	if (opts.ep !== undefined) qs.set('ep', String(opts.ep));
	return qs.size ? `${base}?${qs}` : base;
}

export function groupBySeason(episodes: DisplayItem[]): SeasonGroup[] {
	const map = new Map<number, DisplayItem[]>();
	for (const ep of episodes) {
		const s = ep.season ?? 0;
		if (!map.has(s)) map.set(s, []);
		map.get(s)!.push(ep);
	}
	return [...map.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([season, eps]) => ({
			season,
			episodes: eps.sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0))
		}));
}