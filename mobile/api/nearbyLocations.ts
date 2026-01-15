import { API_BASE_URL } from "@/constants";
import { Place } from "@/types/place";

export type SearchResponse = {
  origin: SearchOrigin;
  count: number;
  results: Place[];
};

export type SearchOrigin = {
  latitude: number;
  longitude: number;
  distance_km: number;
};

export async function nearbyLocations(
  latitude: number,
  longitude: number
): Promise<Place[]> {
  const url = `${API_BASE_URL}/location/nearby?latitude=${latitude}&longitude=${longitude}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }

  const data: SearchResponse = await res.json();

  return data.results;
}
