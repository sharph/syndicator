<script lang="ts">
	import { page } from '$app/stores';
	import type { Feed } from '$lib/api';
	import { getApi } from '$lib/api';
	import { invalidateAll } from '$app/navigation';
	import SubscriptionCard from './SubscriptionCard.svelte';

	const api = getApi(fetch);

	var url = '';

	async function addFeed() {
		try {
			await api.subscribe(url);
			await invalidateAll();
		} catch (e) {
			console.error(e);
		}
	}

	export let data: { subscriptions: Feed[] };
</script>

<div class="ml-auto mr-auto max-w-4xl">
	<div class="flex items-center justify-between gap-4 p-5">
		<input bind:value={url} class="input" type="text" placeholder="Feed URL..." />
		<button class="btn variant-filled" on:click={addFeed}>Add</button>
	</div>

	<div class="grid grid-cols-1 gap-4 p-5">
		{#each data.subscriptions as feed}
			<SubscriptionCard {feed} />
		{/each}
	</div>
</div>
