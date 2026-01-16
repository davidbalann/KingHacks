import { API_BASE_URL } from "@/constants";
import { Place } from "@/types/place";

export async function searchPlaces(
  name?: string,
  category?: string,
  page: number = 1,
  limit: number = 100
): Promise<Place[]> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (category != null) {
    params.append("category", category);
  }
  if (name != null) {
    params.append("name", name);
  }

  const url = `${API_BASE_URL}/search?${params.toString()}&limit=200`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text(); // or res.json() if your API returns JSON
    console.error("Search failed:", {
      status: res.status,
      statusText: res.statusText,
      body: text,
    });

    throw new Error(
      `Search failed (${res.status}): ${text || res.statusText}`
    );
  }
  const data: Place[] = await res.json();

  console.log(data)
  return data;
}
