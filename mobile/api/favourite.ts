const SAVED_PLACES_KEY = "saved_places";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Place } from "@/types/place";

export async function savePlace(place: Place): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(SAVED_PLACES_KEY);
    const places: Place[] = existing ? JSON.parse(existing) : [];

    const index = places.findIndex((p) => p.id === place.id);

    if (index >= 0) {
      // Update existing place
      places[index] = place;
    } else {
      // Add new place
      places.push(place);
    }

    await AsyncStorage.setItem(
      SAVED_PLACES_KEY,
      JSON.stringify(places)
    );
  } catch (error) {
    console.error("Failed to save place:", error);
    throw error;
  }
}

export async function getSavedPlaces(): Promise<Place[]> {
  try {
    const stored = await AsyncStorage.getItem(SAVED_PLACES_KEY);

    if (!stored) {
      return [];
    }

    const places: Place[] = JSON.parse(stored);
    return places;
  } catch (error) {
    console.error("Failed to load saved places:", error);
    return [];
  }
}

export async function deletePlaceById(placeId: number): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(SAVED_PLACES_KEY);

    // Nothing saved → nothing to delete
    if (!stored) {
      return;
    }

    const places: Place[] = JSON.parse(stored);

    const filtered = places.filter((p) => p.id !== placeId);

    if (filtered.length === places.length) {
      return;
    }

    await AsyncStorage.setItem(
      SAVED_PLACES_KEY,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error("Failed to delete place:", error);
    throw error;
  }
}
