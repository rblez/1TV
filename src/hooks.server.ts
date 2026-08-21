import type { Handle } from '@sveltejs/kit';
import { createServerClient } from '$lib/server/supabase';

export const handle: Handle = async ({ event, resolve }) => {
	const supabase = createServerClient(event);
	let session = null;
	if (supabase) {
		const { data } = await supabase.auth.getSession();
		session = data.session;
	}
	event.locals.supabase = supabase;
	event.locals.session = session;
	return resolve(event);
};