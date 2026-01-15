import { apiFetch } from "./client";

type WatchlistResponse = {
  watchlist: number[];
};

export async function fetchWatchlist(): Promise<WatchlistResponse> {
  const response = await apiFetch("/watchlist");
  if (!response.ok) {
    throw new Error(`Failed to fetch watchlist (${response.status})`);
  }
  return response.json();
}

export async function addToWatchlist(serviceId: number): Promise<void> {
  const response = await apiFetch("/watchlist/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ service_id: serviceId }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to add to watchlist (${response.status}) ${errorText || ""}`.trim()
    );
  }
}
