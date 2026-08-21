import { json } from '@sveltejs/kit';
import { syncAll } from '$lib/server/vimeus-sync';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
	const auth = request.headers.get('authorization');
	const cronSecret = (env as Record<string, string | undefined>).CRON_SECRET ?? '';
	const expected = `Bearer ${cronSecret}`;
	// en local permite sin auth; en Vercel exige CRON_SECRET
	if (cronSecret && auth !== expected) return json({ message: 'Unauthorized' }, { status: 401 });

	const logs: string[] = [];
	const result = await syncAll((m) => logs.push(m));
	return json({ ok: true, result, logs });
}

export async function GET() {
	return json({ message: 'POST with Authorization: Bearer $CRON_SECRET to sync' });
}
