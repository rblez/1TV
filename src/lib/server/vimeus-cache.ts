import { createClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';

const TTL_MS = 15 * 60 * 1000; // 15 minutos
const mem = new Map<string, { data: unknown; pages: number | null; at: number }>();

function supa() {
	const url = publicEnv.PUBLIC_SUPABASE_URL;
	const key = publicEnv.PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !key) return null;
	return createClient(url, key);
}

export async function getCached<T>(key: string): Promise<{ data: T[]; pages: number | null } | null> {
	const hit = mem.get(key);
	if (hit && Date.now() - hit.at < TTL_MS) return hit as { data: T[]; pages: number | null };
	const c = supa();
	if (!c) return hit ? (hit as { data: T[]; pages: number | null }) : null;
	const { data } = await c.from('cached_listings').select('data, pages, updated_at').eq('key', key).maybeSingle();
	if (!data) return hit ? (hit as { data: T[]; pages: number | null }) : null;
	const age = Date.now() - new Date((data as { updated_at: string }).updated_at).getTime();
	if (age > TTL_MS) return null; // stale -> refetch
	const val = { data: (data as { data: T[] }).data, pages: (data as { pages: number | null }).pages };
	mem.set(key, { ...val, at: Date.now() });
	return val;
}

export async function setCached<T>(key: string, data: T[], pages: number | null) {
	mem.set(key, { data, pages, at: Date.now() });
	const c = supa();
	if (!c) return;
	await c.from('cached_listings').upsert({ key, data, pages, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}
