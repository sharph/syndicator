import { redirect } from '@sveltejs/kit';
import { getApi, APIUserError } from '$lib/api';
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
        } catch (e) {
            if (e instanceof APIUserError) {
                try {
                    const body = await e.response.json();
                    return {
                        success: false,
                        body
                    };
                } catch { }
                return {
                    success: false,
                    message: e.message,
                };
            }
            return {
                success: false,
                message: (e as any).message,
            };
        }
        if (user) {
            redirect(302, '/');
        }
        return {};
    }
};