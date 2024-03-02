import { browser } from "$app/environment";
import { env } from "$env/dynamic/public"

export const API_ROOT = env.PUBLIC_API_ROOT || (browser ? "http://localhost:8000" : "http://127.0.0.1:8000");

export const APP_TITLE = "syndicator";