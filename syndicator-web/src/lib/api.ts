import { API_ROOT } from "./const";
import type { Cookies } from "@sveltejs/kit";
import { parse as parseSetCookie } from "set-cookie-parser";
import { browser } from "$app/environment";

import * as clientCookies from "cookie";

export function wrapFetchToAddCsrfFromBrowser(f: typeof fetch): typeof fetch {
    // if this isn't running on the browser, this will do nothing
    return async (...args) => {
        const req = new Request(...args);
        if (browser) {
            let csrf = clientCookies.parse(document.cookie).csrftoken;
            if ((req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE') && !csrf) {
                await f(`${API_ROOT}/csrf`, {
                    method: 'POST',
                    credentials: 'include',
                });
                csrf = clientCookies.parse(document.cookie).csrftoken;
            }
            if (csrf) {
                req.headers.set('x-csrftoken', csrf);
            }
        }
        const res = await f(req);
        return res;
    };
}

export function wrapFetchToAddCsrfOnServer(f: typeof fetch, cookies: Cookies): typeof fetch {
    return async (...args) => {
        const req = new Request(...args);
        let csrf = cookies.get('csrftoken');
        if ((req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE') && !csrf) {
            await f(`${API_ROOT}/csrf`, {
                method: 'POST',
                credentials: 'include',
            });
            csrf = cookies.get('csrftoken');
        }
        if (csrf) {
            req.headers.set('x-csrftoken', csrf);
        }
        const res = await f(req);
        return res;
    };
}

export function wrapFetchToPassCookies(f: typeof fetch, cookies: Cookies): typeof fetch {
    return async (...args) => {
        const req = new Request(...args);
        const allCookies = cookies.getAll();
        const cookieStr = allCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
        req.headers.set('cookie', cookieStr);
        const res = await f(req);
        const setCookie = res.headers.getSetCookie();
        setCookie.forEach((cookie) => {
            const parsed = parseSetCookie(cookie);
            parsed.forEach((cookie) => {
                const sameSite = cookie.sameSite;
                let sameSiteVal: "none" | "lax" | "strict" | undefined;
                if (sameSite === "None" || sameSite === "none" || sameSite === undefined) {
                    sameSiteVal = undefined;  // all of this is needed to satisfy type checking
                } else if (sameSite === "Lax") {
                    sameSiteVal = "lax";
                } else if (sameSite === "Strict") {
                    sameSiteVal = "strict";
                } else {
                    throw new Error(`unknown sameSite value: ${sameSite}`);
                }
                cookies.set(cookie.name, cookie.value, {
                    path: cookie.path || "/",
                    domain: cookie.domain,
                    expires: cookie.expires,
                    maxAge: cookie.maxAge,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: sameSiteVal,
                });
            });
        });
        return res;
    };
}

export class APIUserError extends Error {
    response: Response;

    constructor(response: Response) {
        super(response.statusText);
        this.name = "APIUserError";
        this.response = response;
    }
}

export async function apiGet(f: typeof fetch, path: string) {
    const res = await f(`${API_ROOT}${path}`,
        {
            method: 'GET',
            credentials: 'include',
        }
    );
    if (res.status >= 400 && res.status < 500) {
        throw new APIUserError(res);
    }
    if (res.status !== 200) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res;
}

export async function apiPost(f: typeof fetch, path: string, body: any) {
    const res = await f(`${API_ROOT}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include',
    });
    if (res.status >= 400 && res.status < 500) {
        throw new APIUserError(res);
    }
    if (res.status !== 200) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res;
}

export async function apiPatch(f: typeof fetch, path: string, body: any) {
    const res = await f(`${API_ROOT}${path}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include',
    });
    if (res.status >= 400 && res.status < 500) {
        throw new APIUserError(res);
    }
    if (res.status !== 200) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res;
}

export async function apiDelete(f: typeof fetch, path: string) {
    const res = await f(`${API_ROOT}${path}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (res.status >= 400 && res.status < 500) {
        throw new APIUserError(res);
    }
    if (res.status !== 200) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res;
}

export type Feed = {
    title: string;
    description: string | null;
    image: string | null;
    language: string | null;
    last_build_date: string | null;
    pub_date: string | null;
    generator: string | null;
    url: string | null;
    feed_url: string;
    path: string;
};

export type Article = {
    title: string;
    description: string | null;
    link: string;
    image: string | null;
    pub_date: string;
    feed: Feed;
    path: string;
    clicked: boolean | undefined;
};

export type User = {
    email: string;
}

export async function articles(f: typeof fetch): Promise<Article[]> {
    const res = await apiGet(f, '/articles');
    return await res.json();
}

export async function click(f: typeof fetch, path: string): Promise<void> {
    await apiPost(f, `/clicks/${path}`, {});
}

export async function unclick(f: typeof fetch, path: string): Promise<void> {
    await apiDelete(f, `/clicks/${path}`);
}

export async function login(f: typeof fetch, email: string, password: string): Promise<User> {
    const res = await apiPost(f, '/auth/login', { email, password });
    return await res.json();
}

export async function logout(f: typeof fetch): Promise<void> {
    await apiPost(f, '/auth/logout', {});
}

export async function changePassword(f: typeof fetch, oldPassword: string, newPassword: string): Promise<User> {
    const res = await apiPost(f, '/auth/change_password', {
        old_password: oldPassword,
        new_password: newPassword
    });
    return await res.json();
}

export async function user(f: typeof fetch): Promise<User> {
    const res = await apiGet(f, '/auth/user');
    return await res.json();
}

export async function subscriptions(f: typeof fetch): Promise<Feed[]> {
    const res = await apiGet(f, '/subscriptions/');
    return await res.json();
}

export async function subscribe(f: typeof fetch, url: string): Promise<Feed> {
    const res = await apiPost(f, '/subscriptions/', { url });
    return await res.json();
}

export async function unsubscribe(f: typeof fetch, path: string): Promise<void> {
    await apiDelete(f, `/subscriptions/${path}`);
}

export function getApi(f: typeof fetch) {
    const newFetch = wrapFetchToAddCsrfFromBrowser(f);
    return {
        get: (path: string, auth?: string) => apiGet(newFetch, path),
        post: (path: string, body: any) => apiPost(newFetch, path, body),
        patch: (path: string, body: any) => apiPatch(newFetch, path, body),
        delete: (path: string) => apiDelete(newFetch, path),
        articles: () => articles(newFetch),
        click: (path: string) => click(newFetch, path),
        unclick: (path: string) => unclick(newFetch, path),
        login: (email: string, password: string) => login(newFetch, email, password),
        logout: () => logout(newFetch),
        user: () => user(newFetch),
        changePassword: (oldPassword: string, newPassword: string) => changePassword(newFetch, oldPassword, newPassword),
        subscriptions: () => subscriptions(newFetch),
        subscribe: (url: string) => subscribe(newFetch, url),
        unsubscribe: (path: string) => unsubscribe(newFetch, path),
    };
}