import Constants from "expo-constants";

import { withDeviceIdHeader } from "./deviceId";

function getApiBaseUrl(): string {
  const configured =
    process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl;

  if (!configured) {
    throw new Error(
      "Missing API base URL. Set EXPO_PUBLIC_API_BASE_URL or expo.extra.apiBaseUrl."
    );
  }

  return configured.replace(/\/+$/, "");
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const headersWithId = await withDeviceIdHeader(
    (init.headers as Record<string, string>) ?? {}
  );

  return fetch(`${baseUrl}${normalizedPath}`, {
    ...init,
    headers: headersWithId,
  });
}
