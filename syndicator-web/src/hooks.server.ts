import { wrapFetchToPassCookies, wrapFetchToAddCsrfOnServer } from '$lib/api';
import { API_ROOT } from '$lib/const';

export async function handleFetch({ request, fetch, event }) {
	if (request.url.startsWith(API_ROOT)) {
		const headers = new Headers(request.headers);
		headers.set('x-forwarded-proto', 'https');
		const xff = event.request.headers.get('x-forwarded-for');
		if (xff) headers.set('x-forwarded-for', xff);
		const req = new Request(request,
			{
				headers: headers
			}
		);
		let newFetch = wrapFetchToPassCookies(fetch, event.cookies);
		newFetch = wrapFetchToAddCsrfOnServer(newFetch, event.cookies);
		return newFetch(req);
	}
	return fetch(request);
}