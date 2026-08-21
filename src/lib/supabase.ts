import { env } from '$env/dynamic/public';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
	if (client !== undefined) return client;
	const url = env.PUBLIC_SUPABASE_URL;
	const anonKey = env.PUBLIC_SUPABASE_ANON_KEY;
	client = url && anonKey ? createBrowserClient(url, anonKey) : null;
	return client;
}