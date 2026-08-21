<script lang="ts">
	import { page } from '$app/state';
	import { Home01Icon, FilmIcon, TvIcon, FireIcon, SearchIcon, ListViewIcon } from '@hugeicons/core-free-icons';
	import NavLink from '$lib/components/NavLink.svelte';
	import LogoutButton from '$lib/components/LogoutButton.svelte';

	let { children, data } = $props();

	const userEmail = $derived(data.user?.email ?? '');
</script>

<header class="sticky top-0 z-40 border-b border-neutral-900 bg-black/80 backdrop-blur">
	<div class="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-8">
		<a href="/" class="mr-1 flex shrink-0 items-center gap-1 font-mono text-xl font-bold tracking-tighter">
			<span>1</span><span class="bg-white px-1 text-black">TV</span>
		</a>
		<nav class="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto">
			<NavLink title="Inicio" href="/" icon={Home01Icon} active={page.url.pathname === '/'} />
			<NavLink title="Películas" href="/browse/movie" icon={FilmIcon} active={page.url.pathname === '/browse/movie'} />
			<NavLink title="Series" href="/browse/series" icon={TvIcon} active={page.url.pathname === '/browse/series'} />
			<NavLink title="Animados" href="/browse/anime" icon={FireIcon} active={page.url.pathname === '/browse/anime'} />
			<NavLink title="Buscar" href="/search" icon={SearchIcon} active={page.url.pathname === '/search'} />
			<NavLink title="Mi lista" href="/mylist" icon={ListViewIcon} active={page.url.pathname === '/mylist'} />
		</nav>
		<LogoutButton {userEmail} />
	</div>
</header>

<main class="mx-auto max-w-7xl pb-20">{@render children()}</main>