import AsyncStorage from "@react-native-async-storage/async-storage";

export type FavouritePlace = {
  id: number;
  name: string;
  category?: string;
  address?: string;
  latitude: number;
  longitude: number;
  hours?: string; // keep as string (your backend format)
};

const KEY = "FAVOURITES_V1";

export async function getFavourites(): Promise<FavouritePlace[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function addFavourite(place: FavouritePlace) {
  const cur = await getFavourites();
  if (cur.some((p) => p.id === place.id)) return; // no duplicates
  await AsyncStorage.setItem(KEY, JSON.stringify([place, ...cur]));
}

export async function removeFavourite(id: number) {
  const cur = await getFavourites();
  await AsyncStorage.setItem(KEY, JSON.stringify(cur.filter((p) => p.id !== id)));
}
