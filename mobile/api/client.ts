import { API_BASE_URL } from "@/constants";
import { withDeviceIdHeader } from "./deviceId";

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const headersWithId = await withDeviceIdHeader(
    (init.headers as Record<string, string>) ?? {}
  );

  return fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...init,
    headers: headersWithId,
  });
}
