<script lang="ts">
	import Icon from './Icon.svelte';
	import { HeartIcon, HeartAddIcon, HeartRemoveIcon } from '@hugeicons/core-free-icons';
	import { getSupabase } from '$lib/supabase';
	import type { DisplayItem } from '$lib/vimeus';
	import type { IconSvg } from '$lib/icons';

	let { item, initial = false }: { item: DisplayItem; initial?: boolean } = $props();

	let isFav = $state(initial);
	let busy = $state(false);

	async function toggle() {
		const sb = getSupabase();
		if (!sb || busy) return;
		busy = true;
		if (isFav) {
			const { error } = await sb
				.from('favorites')
				.delete()
				.eq('user_id', (await sb.auth.getUser()).data.user!.id)
				.eq('content_type', item.content_type)
				.eq('tmdb_id', item.tmdb_id);
			if (!error) isFav = false;
		} else {
			const { error } = await sb.from('favorites').insert({
				user_id: (await sb.auth.getUser()).data.user!.id,
				content_type: item.content_type,
				tmdb_id: item.tmdb_id,
				imdb_id: item.imdb_id,
				title: item.title,
				poster: item.poster,
				backdrop: item.backdrop
			});
			if (!error) isFav = true;
		}
		busy = false;
	}
</script>

<button
	onclick={toggle}
	title={isFav ? 'Quitar de Mi lista' : 'Agregar a Mi lista'}
	class="flex h-10 w-10 items-center justify-center rounded-full border transition
		{isFav
			? 'border-white bg-white text-black'
			: 'border-neutral-800 text-neutral-400 hover:border-white hover:text-white'}"
>
	<Icon icon={isFav ? HeartIcon : HeartAddIcon} size={18} />
</button>