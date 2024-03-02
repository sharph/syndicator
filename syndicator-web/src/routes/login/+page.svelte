<script lang="ts">
	import { APP_TITLE } from "$lib/const";
	import { invalidate } from "$app/navigation";
	import { onMount } from "svelte";

	export let form;

	onMount(() => {
		invalidate('app:user');
	});
</script>

<svelte:head>
	<title>{APP_TITLE} - Login</title>
</svelte:head>

{#if form?.success === false}
	<div class="ml-auto mr-auto max-w-4xl p-5">
		{#if form.body?.error}
			<div
				class="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
				role="alert"
			>
				{form.body.error}
			</div>
		{/if}
		{#if form.body?.errors}
			{#each form.body.errors as error}
				<div
					class="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
					role="alert"
				>
					<p>{error}</p>
				</div>
			{/each}
		{/if}
		{#if form.message}
			<div
				class="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
				role="alert"
			>
				<p>{form.message}</p>
			</div>
		{/if}
	</div>
{/if}



<div class="ml-auto mr-auto max-w-4xl">
	<form class="flex flex-col gap-4 p-5" method="post">
		<input class="input" name="email" type="text" placeholder="Email" />
		<input class="input" name="password" type="password" placeholder="Password" />
		<button class="btn variant-filled">Login</button>
	</form>
</div>
