import { DEFAULT_API_BASE_URL } from "@/constants/shared";

/** Django API root, without a trailing slash. Set VITE_API_BASE_URL in .env to point elsewhere. */
export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}
