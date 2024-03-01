<script lang="ts">
	export let data;
	export let form;
</script>

<div class="ml-auto mr-auto max-w-4xl p-5 pt-8">
	<div>
		<h1 class="text-4xl font-bold">{data.user?.email}</h1>
	</div>
</div>

{#if form?.success}
	<div class="ml-auto mr-auto max-w-4xl p-5">
		<div class="alert alert-success">
			Password Changed!
		</div>
	</div>
{/if}

{#if form?.success === false}
	<div class="ml-auto mr-auto max-w-4xl p-5">
		{#if form.body.error}
			<div
				class="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
				role="alert"
			>
				{form.body.error}
			</div>
		{/if}
		{#if form.body.errors}
			{#each form.body.errors as error}
				<div
					class="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
					role="alert"
				>
					<p>{error}</p>
				</div>
			{/each}
		{/if}
	</div>
{/if}

<div class="ml-auto mr-auto max-w-4xl">
	<form class="flex flex-col gap-4 p-5" method="post" action="?/changepassword">
		<input class="input" name="oldPassword" type="password" placeholder="Old Password" />
		<input class="input" name="newPassword" type="password" placeholder="New Password" />
		<button class="btn variant-filled">Change Password</button>
	</form>
</div>
