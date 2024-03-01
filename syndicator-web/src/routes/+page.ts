
import { getApi } from '$lib/api';

export async function load({ fetch, depends }) {
    depends('app:user');
    const api = getApi(fetch);
    try {
        const articles = await api.articles();
        return {
            articles
        };
    } catch (e) {
        return {
            articles: []
        }
    }
}