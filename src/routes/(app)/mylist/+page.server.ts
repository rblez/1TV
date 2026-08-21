import { toDisplay, type VimeusItem } from '$lib/vimeus';

export const load = async ({ locals }) => {
	if (!locals.supabase) return { items: [] };
	const { data } = await locals.supabase
		.from('favorites')
		.select('*')
		.order('created_at', { ascending: false });
	const items = (data ?? []).map((r) => toDisplay(r as unknown as VimeusItem));
	return { items };
};