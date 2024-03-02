<script lang="ts">
  import Icon from 'svelte-icons-pack/Icon.svelte';
  import FaSolidHeart from 'svelte-icons-pack/fa/FaSolidHeart';
	import type { Article } from './api';
	import { getApi } from './api';
	export let article: Article;

	const api = getApi(fetch);

	async function click() {
		await api.click(`${article.feed.path}/${article.path}`);
		article.clicked = true;
	}

	async function favorite() {
		if (article.favorited) {
			await api.unfavorite(`${article.feed.path}/${article.path}`);
			article.favorited = false;
		} else {
			await api.favorite(`${article.feed.path}/${article.path}`);
			article.favorited = true;
		}
	}
</script>

<div class="card ml-auto mr-auto max-w-4xl shadow-xl">
	<a target="_blank" href={article.link} on:click={click}>
		<div class="grid grid-cols-1 md:grid-cols-3 w-full bg-surface-50 cardbody border-b-2" class:clicked={article.clicked}>
			<div class="m-4 md:col-span-2">
				<h2 class="text-2xl md:text-4xl font-bold">
					<a target="_blank" href={article.link}>{article.title}</a>
				</h2>
				<p class="text-xl md:text-2xl">{article.feed.title}</p>
				<p class="text-sm">{article.pub_date}</p>
				<p>{article.description}</p>
			</div>
			<div class="m-4 md:col-span-1">
				{#if article.image}
					<img src={article.image} alt={article.title} class="width-auto border-2 border-black" />
				{/if}
			</div>
		</div>
	</a>
	<div class="m-4">
		<button class="btn btn-icon favorite" class:favorited={article.favorited} on:click={favorite}>
			<Icon color="red" src={FaSolidHeart} />
		</button>
	</div>
</div>

<style>
	.card {
		transition: transform 0.2s;
	}
  .card .cardbody {
    transition: background-color 0.2s;
  }
	.card:hover {
		transform: scale(1.01);
	}
  .card .cardbody:hover {
    background-color: rgb(var(--color-primary-50));
  }
	.clicked {
    background-color: rgb(var(--color-primary-200));
	}
  .favorite {
    transition: opacity 0.2s, transform 0.2s, color 0.2s;
    opacity: 0.3;
    transform: scale(0.8);
  }
  .favorite.favorited {
    opacity: 1;
    transform: scale(1);
  }
  .favorite:hover {
    transform: scale(1.5);
  }
</style>
