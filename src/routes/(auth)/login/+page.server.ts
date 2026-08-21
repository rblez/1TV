import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.supabase) {
			return fail(500, { message: 'Supabase no está configurado. Revisa tu .env.local.' });
		}
		const fd = await request.formData();
		const email = String(fd.get('email') ?? '');
		const password = String(fd.get('password') ?? '');
		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
		if (error) return fail(401, { message: 'Email o contraseña incorrectos.' });
		throw redirect(303, '/');
	}
};