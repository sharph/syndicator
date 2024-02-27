
import { getApi } from '$lib/api';

export async function load({ fetch }) {
    const api = getApi(fetch);
    const articles = await api.articles();
    return {
        articles
    };
}