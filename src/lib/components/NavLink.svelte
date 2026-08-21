<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconSvg } from '$lib/icons';

	let {
		title,
		icon,
		href,
		active = false
	}: {
		title: string;
		icon?: IconSvg;
		href: string;
		active?: boolean;
	} = $props();
</script>

<a
	{href}
	class="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition
		{active ? 'bg-white text-black' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}"
>
	{#if icon}<Icon {icon} size={18} />{/if}
	<span>{title}</span>
</a>