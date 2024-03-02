<script lang="ts">
    import { browser } from '$app/environment';
	import InfiniteScroll from 'svelte-infinite-scroll';
	import ArticleCard from '$lib/ArticleCard.svelte';
	import { getApi } from '$lib/api';
	export let data;

	const api = getApi(fetch);
	let locked = false;
    
    const pageElement = browser ? document.getElementById('page') as HTMLElement : undefined;

	async function loadMore() {
		if (locked) return;
		locked = true;
		try {
			data.articles = data.articles.concat(
				await api.articles(data.articles[data.articles.length - 1].pub_date)
			);
		} finally {
			locked = false;
		}
	}
</script>

<div class="grid grid-cols-1 gap-4 p-5">
	{#each data.articles as article}
		<ArticleCard {article} />
	{/each}
      <InfiniteScroll elementScroll={pageElement} threshold={100} on:loadMore={loadMore} />
</div>
