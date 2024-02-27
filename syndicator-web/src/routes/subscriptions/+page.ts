import { getApi } from '$lib/api';

export async function load({ fetch }) {
    const api = getApi(fetch);
    const subscriptions = await api.subscriptions();
    return {
        subscriptions
    };
}