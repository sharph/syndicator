<script lang="ts">
    import ArticleCard from '$lib/ArticleCard.svelte';
    export let data;
</script>

<div class="grid grid-cols-1 gap-4 p-5">
{#each data.articles as article}
    <ArticleCard {article} />
{/each}
</div>