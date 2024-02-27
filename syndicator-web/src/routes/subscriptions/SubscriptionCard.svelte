<script lang="ts">
	import type { Feed } from '$lib/api';
    import { getApi } from '$lib/api';
    import { invalidateAll } from "$app/navigation";
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import FaSolidTrashAlt from 'svelte-icons-pack/fa/FaSolidTrashAlt';
	export let feed: Feed;

    const api = getApi(fetch);

    async function removeFeed() {
        try {
            await api.unsubscribe(feed.path);
            await invalidateAll();
        } catch (e) {
            console.error(e);
        }
    }

</script>

<div class="card bg-surface-50 shadow-xl">
	<div class="flex w-full">
		<div class="m-2 w-auto grow">
			<h2 class="text-xl font-bold">
				{feed.title}
			</h2>
			<p class="text-xl">{feed.description}</p>
			<p class="text-sm">{feed.feed_url}</p>
		</div>
		<div class="m-2 w-24">
			{#if feed.image}
				<img src={feed.image} alt={feed.title} class="width-auto" />
			{/if}
		</div>
	</div>
	<div class="m-2">
		<button class="btn variant-filled btn-icon" on:click={removeFeed}>
			<Icon color="white" src={FaSolidTrashAlt} />
		</button>
	</div>
</div>

<style>
	img {
		max-width: 100%;
		height: auto;
		max-height: 25vh;
	}
</style>
