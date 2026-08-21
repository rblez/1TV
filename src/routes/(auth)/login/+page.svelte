<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { MailIcon, LockKeyIcon } from '@hugeicons/core-free-icons';

	let { form } = $props();
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
		<h1 class="mb-1 text-lg font-semibold">Iniciar sesión</h1>
		<p class="mb-5 text-sm text-neutral-500">Bienvenido de vuelta.</p>
		<form method="POST" class="flex flex-col gap-4">
			<label
				class="flex items-center gap-3 rounded-lg border border-neutral-800 bg-black px-4 py-3 transition focus-within:border-white"
			>
				<Icon icon={MailIcon} size={18} class="text-neutral-500" />
				<input
					name="email"
					type="email"
					required
					placeholder="tu@email.com"
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
				Entrar
			</button>
		</form>
		<p class="mt-5 text-center text-sm text-neutral-500">
			¿Sin cuenta? <a href="/register" class="text-white underline-offset-4 hover:underline">Regístrate</a>
		</p>
	</div>
</div>