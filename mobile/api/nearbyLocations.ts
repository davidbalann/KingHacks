import { API_BASE_URL } from "@/constants";
import { Place } from "@/types/place";

export type SearchOrigin = {
  latitude: number;
  longitude: number;
  distance_km: number;
};

export async function nearbyLocations(
  latitude: number,
  longitude: number
): Promise<Place[]> {
  const url = `${API_BASE_URL}/location/nearby?latitude=${latitude}&longitude=${longitude}&limit=200&radius_km=200`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }

  const data: Place[] = await res.json();

  return data;
}
