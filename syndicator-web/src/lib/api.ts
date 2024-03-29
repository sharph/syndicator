import { API_ROOT } from "./const";
import type { Cookies } from "@sveltejs/kit";
import { parse as parseSetCookie } from "set-cookie-parser";
import { browser } from "$app/environment";
import type { paths } from "./apiTypes";

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



export class SyndicatorAPI {
    fetch: typeof fetch;

    constructor(f: typeof fetch) {
        this.fetch = f;
    }

    async apiGet(path: string) {
        const res = await this.fetch(`${API_ROOT}${path}`,
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

    async apiPost(path: string, body: any) {
        const res = await this.fetch(`${API_ROOT}${path}`, {
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

    async apiPatch(path: string, body: any) {
        const res = await this.fetch(`${API_ROOT}${path}`, {
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

    async apiDelete(path: string) {
        const res = await this.fetch(`${API_ROOT}${path}`, {
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

    async articles(before?: string): Promise<paths['/articles']['get']['responses'][200]['content']['application/json']> {
        let url = '/articles';
        if (before) {
            url += `?before=${before}`;
        }
        const res = await this.apiGet(url);
        return await res.json();
    }

    async favorites(before?: string): Promise<paths['/favorites']['get']['responses'][200]['content']['application/json']> {
        let url = '/favorites';
        if (before) {
            url += `?before=${before}`;
        }
        const res = await this.apiGet(url);
        return await res.json();
    }

    async click(path: string): Promise<paths['/clicks/{feed_key}/{feed_slug}/{item_key}/{item_slug}']['post']['responses'][200]['content']['application/json']> {
        const res = await this.apiPost(`/clicks/${path}`, {});
        return await res.json();
    }

    async unclick(path: string): Promise<paths['/clicks/{feed_key}/{feed_slug}/{item_key}/{item_slug}']['delete']['responses'][200]['content']['application/json']> {
        const res = await this.apiDelete(`/clicks/${path}`);
        return await res.json();
    }

    async favorite(path: string): Promise<paths['/favorites/{feed_key}/{feed_slug}/{item_key}/{item_slug}']['post']['responses'][200]['content']['application/json']> {
        const res = await this.apiPost(`/favorites/${path}`, {});
        return await res.json();
    }

    async unfavorite(path: string): Promise<paths['/favorites/{feed_key}/{feed_slug}/{item_key}/{item_slug}']['delete']['responses'][200]['content']['application/json']> {
        const res = await this.apiDelete(`/favorites/${path}`);
        return await res.json();
    }

    async register(email: string, password: string): Promise<paths['/auth/register']['post']['responses'][200]['content']['application/json']> {
        const res = await this.apiPost('/auth/register', { email, password });
        return await res.json();
    }

    async login(email: string, password: string): Promise<paths['/auth/login']['post']['responses'][200]['content']['application/json']> {
        const res = await this.apiPost('/auth/login', { email, password });
        return await res.json();
    }

    async logout(): Promise<paths['/auth/logout']['post']['responses'][200]['content']['application/json']> {
        const res = await this.apiPost('/auth/logout', {});
        return await res.json();
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<paths['/auth/change_password']['post']['responses'][200]['content']['application/json']> {
        const res = await this.apiPost('/auth/change_password', {
            old_password: oldPassword,
            new_password: newPassword
        });
        return await res.json();
    }

    async user(): Promise<paths['/auth/user']['get']['responses'][200]['content']['application/json']> {
        const res = await this.apiGet('/auth/user');
        return await res.json();
    }

    async subscriptions(): Promise<paths['/subscriptions/']['get']['responses'][200]['content']['application/json']> {
        const res = await this.apiGet('/subscriptions/');
        return await res.json();
    }

    async subscribe(url: string): Promise<paths['/subscriptions/']['post']['responses'][200]['content']['application/json']> {
        const res = await this.apiPost('/subscriptions/', { url });
        return await res.json();
    }

    async unsubscribe(path: string): Promise<paths['/subscriptions/{key}/{slug}']['delete']['responses'][200]['content']['application/json']> {
        const res = await this.apiDelete(`/subscriptions/${path}`);
        return await res.json();
    }

}

export function getApi(f: typeof fetch) {
    const newFetch = wrapFetchToAddCsrfFromBrowser(f);
    return new SyndicatorAPI(newFetch);
}