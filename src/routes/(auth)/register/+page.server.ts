import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	signup: async ({ request, locals }) => {
		if (!locals.supabase) {
			return fail(500, { message: 'Supabase no está configurado. Revisa tu .env.local.' });
		}
		const fd = await request.formData();
		const email = String(fd.get('email') ?? '').trim();
		const password = String(fd.get('password') ?? '');
		if (!email || password.length < 6) {
			return fail(400, { message: 'Email válido y contraseña de al menos 6 caracteres.' });
		}
		const { data: allowed } = await locals.supabase
			.from('allowed_emails')
			.select('email')
			.eq('email', email)
			.maybeSingle();
		if (!allowed) {
			return fail(400, { message: 'Este email no está autorizado para registrarse.', email });
		}
		const { data, error } = await locals.supabase.auth.signUp({ email, password });
		if (error) {
			return fail(400, { message: error.message, email });
		}
		if (data.session) throw redirect(303, '/');
		return { otpSent: true, email };
	},
	verify: async ({ request, locals }) => {
		if (!locals.supabase) {
			return fail(500, { message: 'Supabase no está configurado. Revisa tu .env.local.' });
		}
		const fd = await request.formData();
		const email = String(fd.get('email') ?? '');
		const token = String(fd.get('token') ?? '').trim();
		if (!token) return fail(400, { message: 'Ingresa el código.', otpSent: true, email });
		const { error } = await locals.supabase.auth.verifyOtp({ email, token, type: 'email' });
		if (error) {
			return fail(400, { message: 'Código incorrecto o expirado.', otpSent: true, email });
		}
		throw redirect(303, '/');
	}
};