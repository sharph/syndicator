import { getApi } from '$lib/api';
import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { invalidate } from '$app/navigation';

export async function load({ fetch }) {
    const api = getApi(fetch);
    try {
        await api.logout();
    } catch (e) {
    }
    throw redirect(307, '/login');
}