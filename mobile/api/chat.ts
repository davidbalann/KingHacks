import { API_BASE_URL } from "@/constants";

export interface BackboardRequest {
  query: string;
  latitude: number;
  longitude: number;
  radius_km?: number;
  limit?: number;
  category?: string;
}

export interface BackboardResponse {
  answer: string;
  context_used: any[]; // list of nearby places
  backboard: any; // raw SDK response
}

export async function backboardChat(body: BackboardRequest): Promise<BackboardResponse> {
  const url = API_BASE_URL.replace(/\/$/, "") + "/backboard"; // remove trailing slash just in case

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Backboard request failed:", {
      status: res.status,
      statusText: res.statusText,
      body: text,
    });
    throw new Error(`Backboard request failed (${res.status}): ${text || res.statusText}`);
  }

  const data: BackboardResponse = await res.json();
  return data;
}
