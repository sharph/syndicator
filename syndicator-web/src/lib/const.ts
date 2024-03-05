import { browser } from "$app/environment";
import { env } from "$env/dynamic/public"

export const API_ROOT = env.PUBLIC_API_ROOT || (browser ? "http://localhost:8000" : "http://127.0.0.1:8000");

export const GIT_HASH = env.PUBLIC_GIT_HASH || null;
export const GIT_HASH_SHORT = GIT_HASH ? GIT_HASH.substring(0, 7) : null;

export const APP_TITLE = "syndicator";
export const SHOW_VERSION = true;
export const GITHUB_REPO_LINK = GIT_HASH ? `https://github.com/sharph/syndicator/tree/${GIT_HASH}` : 'https://github.com/sharph/syndicator/';