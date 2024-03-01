<script lang="ts">
	import type { Article } from './api';
  import { getApi } from './api';
	export let article: Article;

  const api = getApi(fetch);

  async function click() {
    await api.click(`${article.feed.path}/${article.path}`);
    article.clicked = true;
  }
</script>

<div class="card shadow-xl bg-surface-50 max-w-4xl ml-auto mr-auto" class:clicked={article.clicked}>
<a target="_blank" href={article.link} on:click={click}>
	<div class="flex w-full">
		<div class="m-4 w-2/3">
			<h2 class="text-4xl font-bold">
				<a target="_blank" href={article.link}>{article.title}</a>
			</h2>
			<p class="text-2xl">{article.feed.title}</p>
			<p class="text-sm">{article.pub_date}</p>
			<p>{article.description}</p>
		</div>
		<div class="m-4 w-1/3">
			{#if article.image}
				<img src={article.image} alt={article.title} class="width-auto border-black border-2" />
			{/if}
		</div>
	</div>
</a>
</div>

<style>
  .card {
    transition: transform 0.2s, background-color 0.2s;
  }
  .card:hover {
    transform: scale(1.01);
    background-color: rgb(var(--color-primary-100));
  }
  .clicked {
    color: rgb(var(--color-primary-500));
  }
</style>