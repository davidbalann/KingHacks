import { API_BASE_URL } from "@/constants";
import { Place } from "@/types/place";

type SearchResponse = {
  results: Place[];
  page: number;
  limit: number;
  total?: number;
};

export async function searchPlaces(
  category?: string,
  page: number = 1,
  limit: number = 200
): Promise<Place[]> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (category != null) {
    params.append("category", category);
  }

  const url = `${API_BASE_URL}/search?${params.toString()}`;

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
