export type LatLng = {
  latitude: number;
  longitude: number;
};

export type WalkingTimeEstimate = {
  durationText: string;
  durationValue: number;
  distanceText: string;
  distanceValue: number;
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyBZvqDDYUaoIJbylrHkOwhf2p_LFzN_MpY';

export async function getWalkingTimeEstimate(
  origin: LatLng,
  destination: LatLng
): Promise<WalkingTimeEstimate> {
  const res = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        },
        travelMode: "WALK",
      }),
    }
  );

  const text = await res.text();

  if (!res.ok) {
    console.error("Routes API error:", text);
    throw new Error(`Routes API failed: ${res.status}`);
  }

  const data = JSON.parse(text);

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No walking route found");
  }

  const route = data.routes[0];

  const durationSeconds = parseInt(route.duration.replace("s", ""), 10);
  const distanceMeters = route.distanceMeters;

  return {
    durationText: `${Math.round(durationSeconds / 60)} mins`,
    durationValue: durationSeconds,
    distanceText: `${(distanceMeters / 1000).toFixed(1)} km`,
    distanceValue: distanceMeters,
  };
}