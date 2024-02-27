import { redirect } from '@sveltejs/kit';
import { getApi } from '$lib/api';
import { invalidate } from '$app/navigation';

export const actions = {
    default: async ({ request, fetch }) => {
        const data = await request.formData();
        const api = getApi(fetch);
        let user = null;
        try {
            user = await api.login(
                data.get('email') as string,
                data.get('password') as string
            );
        } catch (e) { }
        if (user) {
            redirect(302, '/');
        }
        return {};
    }
};