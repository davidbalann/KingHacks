import rawData from "@/data.json";
import { Place, PlaceHours } from "@/types/place";

function parseHours(hours: unknown): PlaceHours | null {
  if (!hours || typeof hours !== "string") return null;

  try {
    return JSON.parse(hours) as PlaceHours;
  } catch {
    return null;
  }
}

export function getPlacesFromFile(): Place[] {
  return rawData.results.map((p: any): Place => ({
    id: p.id,
    name: p.name,
    category: p.category,
    address: p.address,
    latitude: p.latitude,
    longitude: p.longitude,
    phone: p.phone ?? null,
    website: p.website ?? null,
    hours: parseHours(p.hours),
    last_verified: p.last_verified,
  }));
}
