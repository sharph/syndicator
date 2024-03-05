<script lang="ts">
	import '../app.pcss';
	import { APP_TITLE, SHOW_VERSION, GITHUB_REPO_LINK, GIT_HASH_SHORT, API_ROOT } from '$lib/const';
	import {
		AppShell,
		AppRail,
		AppRailAnchor,
		AppBar,
		TabGroup,
		TabAnchor
	} from '@skeletonlabs/skeleton';
	import type { AfterNavigate } from '@sveltejs/kit';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import FaSolidRss from 'svelte-icons-pack/fa/FaSolidRss';
	import FaNewspaper from 'svelte-icons-pack/fa/FaNewspaper';
	import FaSolidUser from 'svelte-icons-pack/fa/FaSolidUser';
	import FaSolidHeart from 'svelte-icons-pack/fa/FaSolidHeart';
	import FaSolidSignInAlt from 'svelte-icons-pack/fa/FaSolidSignInAlt';
	import FaSolidSignOutAlt from 'svelte-icons-pack/fa/FaSolidSignOutAlt';
	import FaSolidUserPlus from 'svelte-icons-pack/fa/FaSolidUserPlus';
	export let data;

	// reset scroll position fix

	afterNavigate((params: AfterNavigate) => {
		const isNewPage = params.from?.url.pathname !== params.to?.url.pathname;
		const elemPage = document.querySelector('#page');
		if (isNewPage && elemPage !== null) {
			elemPage.scrollTop = 0;
		}
	});
</script>

<svelte:head>
	<title>{APP_TITLE}</title>
</svelte:head>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar gridColumns="grid-cols-1" slotDefault="place-self-center" slotTrail="place-content-end">
			<h1 class="title text-2xl">{APP_TITLE}</h1>
		</AppBar>
		<TabGroup
			active="variant-filled-primary"
			hover="hover:variant-soft-primary"
			flex="flex-1 lg:flex-none"
			rounded=""
			border=""
			class="bg-surface-100-800-token block w-full md:hidden"
		>
			{#if data.user}
				<TabAnchor href="/" selected={$page.url.pathname === '/'}>
					<svelte:fragment slot="lead">
						<Icon src={FaNewspaper} />
					</svelte:fragment>
					<span>Articles</span>
				</TabAnchor>
				<TabAnchor href="/favorites" selected={$page.url.pathname === '/favorites'}>
					<svelte:fragment slot="lead">
						<Icon src={FaSolidHeart} />
					</svelte:fragment>
					<span>Favorites</span>
				</TabAnchor>
				<TabAnchor href="/subscriptions" selected={$page.url.pathname === '/subscriptions'}>
					<svelte:fragment slot="lead">
						<Icon src={FaSolidRss} />
					</svelte:fragment>
					<span>Subscriptions</span>
				</TabAnchor>
				<TabAnchor href="/account" selected={$page.url.pathname === '/account'}>
					<svelte:fragment slot="lead">
						<Icon src={FaSolidUser} />
					</svelte:fragment>
					<span>Account</span>
				</TabAnchor>
				<TabAnchor href="/logout">
					<svelte:fragment slot="lead">
						<Icon src={FaSolidSignOutAlt} />
					</svelte:fragment>
					<span>Logout</span>
				</TabAnchor>
			{:else}
				<TabAnchor href="/login">
					<svelte:fragment slot="lead">
						<Icon src={FaSolidSignInAlt} />
					</svelte:fragment>
					<span>Login</span>
				</TabAnchor>
				<TabAnchor href="/register">
					<svelte:fragment slot="lead">
						<Icon src={FaSolidUserPlus} />
					</svelte:fragment>
					<span>Register</span>
				</TabAnchor>
			{/if}
		</TabGroup>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<AppRail class="hidden md:block">
			{#if data.user}
				<AppRailAnchor href="/" selected={$page.url.pathname === '/'}>
					<svelte:fragment slot="lead">
						<Icon src={FaNewspaper} />
					</svelte:fragment>
					<span>Articles</span>
				</AppRailAnchor>
				<AppRailAnchor href="/favorites" selected={$page.url.pathname === '/favorites'}>
					<svelte:fragment slot="lead">
						<Icon src={FaSolidHeart} />
					</svelte:fragment>
					<span>Favorites</span>
				</AppRailAnchor>
				<AppRailAnchor href="/subscriptions" selected={$page.url.pathname === '/subscriptions'}>
					<svelte:fragment slot="lead">
						<Icon src={FaSolidRss} />
					</svelte:fragment>
					<span>Subscriptions</span>
				</AppRailAnchor>
				<AppRailAnchor href="/account" selected={$page.url.pathname === '/account'}>
					<svelte:fragment slot="lead">
						<Icon src={FaSolidUser} />
					</svelte:fragment>
					<span>Account</span>
				</AppRailAnchor>
				<AppRailAnchor href="/logout">
					<svelte:fragment slot="lead">
						<Icon src={FaSolidSignOutAlt} />
					</svelte:fragment>
					<span>Logout</span>
				</AppRailAnchor>
			{:else}
				<AppRailAnchor href="/login">
					<svelte:fragment slot="lead">
						<Icon src={FaSolidSignInAlt} />
					</svelte:fragment>
					<span>Login</span>
				</AppRailAnchor>
				<AppRailAnchor href="/register">
					<svelte:fragment slot="lead">
						<Icon src={FaSolidUserPlus} />
					</svelte:fragment>
					<span>Register</span>
				</AppRailAnchor>
			{/if}
		</AppRail>
	</svelte:fragment>
	<slot />
	<svelte:fragment slot="footer">
		{#if SHOW_VERSION}
			<div class="hidden md:block">
				<AppBar
					gridColumns="grid-cols-1"
					slotDefault="place-self-start"
					slotTrail="place-content-end"
				>
					<a class="me-3" href={GITHUB_REPO_LINK}>syndicator/{GIT_HASH_SHORT || 'dev'}</a>
					<a class="me-3" href={`${API_ROOT}/docs`}>API</a>
					<a class="me-3" href="https://github.com/sharph/syndicator/blob/main/LICENSE.txt">AGPLv3</a>
				</AppBar>
			</div>
		{/if}
	</svelte:fragment>
</AppShell>

<style type="text/css">
	@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

	.title {
		font-family: 'Pacifico', cursive;
	}
</style>
