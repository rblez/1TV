import { setCached } from './vimeus-cache';
import { VIMEUS_BASE } from '$lib/vimeus';
import { env as privateEnv } from '$env/dynamic/private';
import type { VimeusItem } from '$lib/vimeus';

function apiKey(): string {
	const k = privateEnv.VIMEUS_API_KEY;
	if (!k) throw new Error('VIMEUS_API_KEY missing');
	return k;
}

async function fetchPage(key: 'movies' | 'series' | 'animes', page: number) {
	const url = `${VIMEUS_BASE}/api/listing/${key}?page=${page}`;
	const r = await fetch(url, { headers: { Accept: 'application/json', 'X-API-Key': apiKey() } });
	const body = (await r.json()) as { error?: boolean; data?: { result?: VimeusItem[]; pages?: number } };
	if (r.status !== 200 || body.error || !body.data?.result) throw new Error(`page ${page} failed: ${r.status}`);
	const inferred = key === 'movies' ? 'movie' : key === 'animes' ? 'anime' : 'series';
	for (const it of body.data.result as VimeusItem[]) if (!(it as unknown as Record<string, unknown>).content_type) (it as unknown as Record<string, unknown>).content_type = inferred;
	return { items: body.data.result as VimeusItem[], pages: body.data.pages ?? null };
}

export async function syncAll(
	onProgress?: (msg: string) => void
): Promise<Record<string, { pages: number; total: number }>> {
	const res: Record<string, { pages: number; total: number }> = {};
	for (const key of ['movies', 'series', 'animes'] as const) {
		onProgress?.(`[${key}] page 1...`);
		const first = await fetchPage(key, 1);
		const totalPages = first.pages ?? 1;
		let all = [...first.items];
		await setCached(`${key}:p1`, first.items, totalPages);
		onProgress?.(`[${key}] 1/${totalPages} (${first.items.length})`);
		for (let p = 2; p <= totalPages; p++) {
			// throttle 150ms para no saturar vimeus
			await new Promise((r) => setTimeout(r, 150));
			onProgress?.(`[${key}] page ${p}/${totalPages}...`);
			const { items } = await fetchPage(key, p);
			all.push(...items);
			await setCached(`${key}:p${p}`, items, totalPages);
			onProgress?.(`[${key}] ${p}/${totalPages} (${items.length})`);
		}
		await setCached(`${key}:all`, all, totalPages);
		res[key] = { pages: totalPages, total: all.length };
		onProgress?.(`[${key}] done ${all.length} items`);
	}
	return res;
}
