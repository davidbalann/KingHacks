export type PlaceStatus = "open" | "closingSoon" | "pickup" | "closed";

// Convert status to color
export function statusToColor(s: PlaceStatus): string {
  if (s === "open") return "#16A34A"; // Green for open
  if (s === "closingSoon") return "#FACC15"; // Yellow for closing soon
  if (s === "pickup") return "#EF4444"; // Red for pickup
  return "#9CA3AF"; // Gray for closed
}

// Convert status to label
export function statusToLabel(s: PlaceStatus): string {
  if (s === "open") return "Open";
  if (s === "closingSoon") return "Closing soon";
  if (s === "pickup") return "Pickup";
  return "Closed";
}

// Stable per place.id for the whole app session.
// (So marker + sheet match.)
const cache = new Map<string, PlaceStatus>();

// Get a random status for the place
export function getStatusForPlaceId(placeId: string | number): PlaceStatus {
  const key = String(placeId);
  const existing = cache.get(key);
  if (existing) return existing;

  // Random status logic
  const r = Math.random();
  const s: PlaceStatus =
    r < 0.8 ? "open" : 
    r < 0.9 ? "closingSoon" : 
    r < 0.95 ? "pickup" : 
    "closed";

  cache.set(key, s);
  return s;
}
