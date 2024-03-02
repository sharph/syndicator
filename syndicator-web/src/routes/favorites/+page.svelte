<script lang="ts">
    import { APP_TITLE } from '$lib/const';
	import { browser } from '$app/environment';
	import InfiniteScroll from 'svelte-infinite-scroll';
	import ArticleCard from '$lib/ArticleCard.svelte';
	import { getApi } from '$lib/api';
	export let data;

	const api = getApi(fetch);
	let locked = false;

	const pageElement = browser ? (document.getElementById('page') as HTMLElement) : undefined;

    let lastFavorite: string | undefined = data.articles.length === 0 ? undefined : data.articles[data.articles.length - 1].favorited as string;

	async function loadMore() {
		if (locked) return;
		locked = true;
		try {
			data.articles = data.articles.concat(
				await api.favorites(lastFavorite)
			);
            lastFavorite = data.articles[data.articles.length - 1].favorited as string;
		} finally {
			locked = false;
		}
	}
</script>

<svelte:head>
    <title>{APP_TITLE} - Favorites</title>
</svelte:head>

<div class="grid grid-cols-1 gap-4 p-5">
	{#each data.articles as article}
		<ArticleCard {article} />
	{/each}
	<InfiniteScroll elementScroll={pageElement} threshold={100} on:loadMore={loadMore} />
</div>
