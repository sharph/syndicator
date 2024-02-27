import { getApi } from '$lib/api';


export async function load({ fetch, depends,  }) {
    depends('app:user');
    const api = getApi(fetch);
    let user = null;
    try {
        user = await api.user();
    } catch (e) {
    }
    if (!user) {

    }
    return {
        user
    };
}