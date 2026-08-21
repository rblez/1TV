<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import type { IconSvg } from '$lib/icons';

	let {
		icon,
		size = 24,
		strokeWidth = 1.5,
		class: className = ''
	}: {
		icon: IconSvg;
		size?: number | string;
		strokeWidth?: number;
		class?: string;
	} = $props();
</script>

<HugeiconsIcon {icon} {size} {strokeWidth} color="currentColor" class={className} />