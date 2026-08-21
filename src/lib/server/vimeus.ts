import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import {
	VIMEUS_BASE,
	toDisplay,
	type DisplayItem,
	type VimeusContentType,
	type VimeusItem,
	type VimeusListing
} from '$lib/vimeus';
import { getCached, setCached } from './vimeus-cache';

export class VimeusError extends Error {
	constructor(
		message: string,
		readonly status: number = 500
	) {
		super(message);
		this.name = 'VimeusError';
	}
}

function apiKey(): string {
	const key = privateEnv.VIMEUS_API_KEY;
	if (!key) {
		throw new VimeusError('VIMEUS_API_KEY no está configurada en .env.local', 500);
	}
	return key;
}

export function viewKey(): string {
	const key = publicEnv.PUBLIC_VIMEUS_VIEW_KEY;
	if (!key) {
		throw new VimeusError('PUBLIC_VIMEUS_VIEW_KEY no está configurada en .env.local', 500);
	}
	return key;
}

async function listing<T extends VimeusItem>(
	key: 'movies' | 'series' | 'animes' | 'episodes',
	params: Record<string, string | number | undefined> = {}
): Promise<VimeusListing<T>> {
	const page = Number(params.page ?? 1);
	const cacheKey = key === 'episodes' ? null : `${key}:p${page}`;
	if (cacheKey) {
		const cached = await getCached<T>(cacheKey);
		if (cached) {
			const pagination = cached.pages !== null ? {
				current_page: page,
				total_pages: cached.pages,
				has_next: page < cached.pages,
				has_prev: page > 1,
				total_results: cached.pages * (cached.data.length || 100),
				per_page: cached.data.length || 100
			} as VimeusListing<T>['pagination'] : null;
			const inferred = key === 'movies' ? ('movie' as const) : key === 'animes' ? ('anime' as const) : ('series' as const);
			const typed = (cached.data as T[]).map((it) => {
				const anyItem = it as Record<string, unknown>;
				if (anyItem.content_type == null) (anyItem as Record<string, unknown>).content_type = inferred;
				return it;
			});
			return { items: typed, pagination };
		}
	}
	const qs = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
	}
	const url = `${VIMEUS_BASE}/api/listing/${key}${qs.size > 0 ? `?${qs.toString()}` : ''}`;
	const res = await fetch(url, {
		headers: { Accept: 'application/json', 'X-API-Key': apiKey() }
	});
	let body: { error?: boolean; message?: string; data?: unknown } | null = null;
	try {
		body = await res.json();
	} catch {
		// body vacío o no JSON
	}
	if (!res.ok || !body || body.error || !body.data) {
		throw new VimeusError(body?.message ?? `HTTP ${res.status}`, res.status);
	}
	const data = body.data as T[] | Record<string, unknown> | null;
	if (Array.isArray(data)) {
		return { items: data as T[], pagination: null };
	}
	if (data && typeof data === 'object') {
		const raw = data as Record<string, unknown>;
		// forma real del API: { result: [...], pages: 79 }
		if (Array.isArray(raw.result)) {
			const pages = typeof raw.pages === 'number' ? (raw.pages as number) : null;
			const currentPage = Number(params.page ?? 1);
			const pagination =
				pages !== null
					? {
							current_page: currentPage,
							total_pages: pages,
							has_next: currentPage < pages,
							has_prev: currentPage > 1,
							total_results: pages * (raw.result as unknown[]).length,
							per_page: 100
						}
					: null;
			const inferred =
				key === 'movies' ? ('movie' as const) : key === 'animes' ? ('anime' as const) : ('series' as const);
			// derivar content_type del endpoint cuando falta (API no devuelve ese campo)
			const typed = (raw.result as T[]).map((item: T) => {
				const anyItem = item as Record<string, unknown>;
				if (anyItem.content_type == null) {
					(anyItem as Record<string, unknown>).content_type = inferred;
				}
				return item;
			});
			if (cacheKey) await setCached(cacheKey, typed as unknown as VimeusItem[] as never, pages);
			return { items: typed, pagination: pagination as VimeusListing<T>['pagination'] };
		}
		// fallback doc: { movies: [...] } / { pagination: {...} }
		if (Array.isArray(raw[key])) {
			return {
				items: raw[key] as T[],
				pagination: (raw.pagination as VimeusListing<T>['pagination']) ?? null
			};
		}
	}
	return { items: [], pagination: null };
}

export function listMovies(page = 1) {
	return listing<VimeusItem>('movies', { page });
}

export function listSeries(page = 1) {
	return listing<VimeusItem>('series', { page });
}

export function listAnimes(page = 1) {
	return listing<VimeusItem>('animes', { page });
}

export function listEpisodes(page = 1, tmdbId?: number, season?: number) {
	return listing<VimeusItem>('episodes', { page, tmdb_id: tmdbId, season });
}

export async function fetchAllEpisodes(tmdbId: number): Promise<DisplayItem[]> {
	const out: VimeusItem[] = [];
	let page = 1;
	for (let i = 0; i < 20; i++) {
		const { items, pagination } = await listEpisodes(page, tmdbId);
		out.push(...items);
		if (items.length === 0) break;
		if (pagination && !pagination.has_next) break;
		// sin pagination conocida, avanza mientras haya resultados
		page += 1;
	}
	return out.map((it) => toDisplay(it, 'series'));
}

export interface EmbedOptions {
	se?: number;
	ep?: number;
}

export function buildEmbedUrl(
	type: VimeusContentType,
	tmdbId: number | string,
	opts: EmbedOptions = {}
): string {
	const segment = type === 'movie' ? 'movie' : type === 'series' ? 'serie' : 'anime';
	const params = new URLSearchParams({ tmdb: String(tmdbId), view_key: viewKey() });
	if (opts.se !== undefined && opts.se !== null) params.set('se', String(opts.se));
	if (opts.ep !== undefined && opts.ep !== null) params.set('ep', String(opts.ep));
	return `${VIMEUS_BASE}/e/${segment}?${params.toString()}`;
}