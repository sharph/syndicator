import { getApi } from '$lib/api';
import { redirect } from '@sveltejs/kit';
import { invalidate } from '$app/navigation';

export async function load({ fetch }) {
    const api = getApi(fetch);
    await api.logout();
    invalidate('app:user');
    redirect(302, '/login');
}