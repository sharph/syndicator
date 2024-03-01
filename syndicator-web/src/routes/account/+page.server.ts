import { getApi, APIUserError } from '$lib/api';

export const actions = {
    changepassword: async ({ request, fetch }) => {
        const data = await request.formData();
        const api = getApi(fetch);
        const oldPassword = data.get('oldPassword');
        const newPassword = data.get('newPassword');
        try {
            await api.changePassword(oldPassword as string, newPassword as string);
            return {
                success: true,
            };
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
            };
        }
    }
};