<script lang="ts">
	import type { Feed } from '$lib/api';
	import { getApi, APIUserError } from '$lib/api';
	import { invalidateAll } from '$app/navigation';
	import SubscriptionCard from './SubscriptionCard.svelte';

	const api = getApi(fetch);

	var url = '';

	let busy = false;
	let error: any = null;

	async function addFeed() {
		busy = true;
		try {
			await api.subscribe(url);
            error = null;
            url = '';
			await invalidateAll();
		} catch (e) {
			if (e instanceof APIUserError) {
				error = {
					message: e.message,
					body: await e.response.json()
				};
			} else {
				console.error(e);
			}
		} finally {
			busy = false;
		}
	}

    function keyPress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            addFeed();
        }
    }

	export let data: { subscriptions: Feed[] };
</script>

<div class="ml-auto mr-auto max-w-4xl">
	<div class="p-5">
		{#if error?.body?.error}
			<div
				class="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
				role="alert"
			>
				<p>{error.body.error}</p>
			</div>
		{/if}
	</div>

	<div class="flex items-center justify-between gap-4 p-5">
		<input disabled={busy} bind:value={url} on:keypress={keyPress} class="input" type="text" placeholder="Feed URL..." />
		<button disabled={busy} class="btn variant-filled" on:click={addFeed}>Add</button>
	</div>

	<div class="grid grid-cols-1 gap-4 p-5">
		{#each data.subscriptions as feed}
			<SubscriptionCard {feed} />
		{/each}
	</div>
</div>
