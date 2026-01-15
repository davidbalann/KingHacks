import { Place } from "@/types/place";

const API_BASE_URL = "http://127.0.0.1:8000";

type SearchResponse = {
  results: Place[];
  page: number;
  limit: number;
  total?: number;
};

export async function searchPlaces(
  page: number = 1,
  limit: number = 20
): Promise<Place[]> {
  const url = `${API_BASE_URL}/search?page=${page}&limit=${limit}`;

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
