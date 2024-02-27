import { browser } from "$app/environment";

export const API_ROOT = browser ? "http://localhost:8000" : "http://127.0.0.1:8000";