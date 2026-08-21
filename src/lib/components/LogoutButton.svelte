<script lang="ts">
	import { LogoutIcon } from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';

	let { userEmail }: { userEmail: string } = $props();
</script>

<form method="POST" action="/logout" class="flex items-center gap-3">
	<span class="hidden max-w-40 truncate text-xs text-neutral-500 sm:block">{userEmail}</span>
	<button
		type="submit"
		title="Cerrar sesión"
		class="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition hover:border-white hover:text-white"
	>
		<Icon icon={LogoutIcon} size={18} />
	</button>
</form>