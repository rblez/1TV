<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { MailIcon, LockKeyIcon } from '@hugeicons/core-free-icons';

	interface RegisterForm {
		message?: string;
		otpSent?: boolean;
		email?: string;
	}

	let { form }: { form?: RegisterForm } = $props();
</script>

<div class="flex min-h-dvh flex-col items-center justify-center px-4">
	<div class="mb-8 text-center">
		<div class="font-mono text-5xl font-bold tracking-tighter">
			1<span class="bg-white px-1 text-black">TV</span>
		</div>
		<p class="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
			Acceso privado
		</p>
	</div>
	<div class="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 p-6">
		{#if form?.otpSent}
			<h1 class="mb-1 text-lg font-semibold">Código de verificación</h1>
			<p class="mb-5 text-sm text-neutral-500">
				Te enviamos un código por email a <span class="text-white">{form.email}</span>
			</p>
			<form method="POST" action="?/verify" class="flex flex-col gap-4">
				<input type="hidden" name="email" value={form.email} />
				<input
					name="token"
					required
					autocomplete="one-time-code"
					inputmode="numeric"
					pattern="[0-9]{6}"
					placeholder="000000"
					class="rounded-lg border border-neutral-800 bg-black px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none transition focus:border-white"
				/>
				{#if form?.message}
					<p class="text-sm text-red-400">{form.message}</p>
				{/if}
				<button
					type="submit"
					class="rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-neutral-300"
				>
					Verificar e ingresar
				</button>
			</form>
		{:else}
			<h1 class="mb-1 text-lg font-semibold">Registrarse</h1>
			<p class="mb-5 text-sm text-neutral-500">
				Solo emails autorizados. Recibirás un código de verificación por email.
			</p>
			<form method="POST" action="?/signup" class="flex flex-col gap-4">
				<label
					class="flex items-center gap-3 rounded-lg border border-neutral-800 bg-black px-4 py-3 transition focus-within:border-white"
				>
					<Icon icon={MailIcon} size={18} class="text-neutral-500" />
					<input
						name="email"
						type="email"
						required
						placeholder="tu@email.com"
						value={form?.email ?? ''}
						class="w-full bg-transparent outline-none"
					/>
				</label>
				<label
					class="flex items-center gap-3 rounded-lg border border-neutral-800 bg-black px-4 py-3 transition focus-within:border-white"
				>
					<Icon icon={LockKeyIcon} size={18} class="text-neutral-500" />
					<input
						name="password"
						type="password"
						required
						minlength="6"
						placeholder="Contraseña"
						class="w-full bg-transparent outline-none"
					/>
				</label>
				{#if form?.message}
					<p class="text-sm text-red-400">{form.message}</p>
				{/if}
				<button
					type="submit"
					class="rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-neutral-300"
				>
					Crear cuenta
				</button>
			</form>
		{/if}
		<p class="mt-5 text-center text-sm text-neutral-500">
			¿Ya tienes cuenta? <a href="/login" class="text-white underline-offset-4 hover:underline">Inicia sesión</a>
		</p>
	</div>
</div>