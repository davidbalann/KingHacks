import React, { useRef, useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import CustomMarker from "./CustomMarker";
import SearchBar from "./SearchBar";
import { getPlacesFromFile } from "@/api/places";
import PlaceSheet from "./PlaceSheet";
import { Place } from "@/types/place";
import { addToWatchlist } from "@/api/watchlist";

const MAP_STYLE = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];



const KINGSTON_MARKERS = [
  {
    id: "1",
    title: "Queen’s University",
    description: "Main campus",
    latitude: 44.2253,
    longitude: -76.4951,
  },
  {
    id: "2",
    title: "Kingston Waterfront",
    description: "Lake Ontario",
    latitude: 44.2312,
    longitude: -76.486,
  },
  {
    id: "3",
    title: "Fort Henry",
    description: "Historic site",
    latitude: 44.2417,
    longitude: -76.4634,
  },
];

export default function Map() {
  const [selectedMarker, setSelectedMarker] = useState<Place>(null);
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const sheetRef = useRef<TrueSheet>(null);
  const places = getPlacesFromFile();

  const onMarkerPress = async (marker: Place) => {
    setSelectedMarker(marker);
    await sheetRef.current?.present();
  };

  const dismissSheet = async () => {
    await sheetRef.current?.dismiss();
    setSelectedMarker(null);
  };

  const handleFavorite = async () => {
    if (!selectedMarker || isSaving) return;
    setIsSaving(true);
    try {
      await addToWatchlist(selectedMarker.id);
      Alert.alert("Saved", "Added to your watchlist for this device.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not add to watchlist. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 44.2312,
          longitude: -76.486,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={MAP_STYLE}
        showsUserLocation
      >
        {places.map(place => (
          <CustomMarker
            key={place.id}
            latitude={place.latitude}
            longitude={place.longitude}
            selected={selectedMarker?.id === place.id}
            onPress={() => onMarkerPress(place)}
          />
        ))}
      </MapView>

      <SearchBar value={query} onChangeText={setQuery} />

      {/* TrueSheet */}
      <PlaceSheet
        sheetRef={sheetRef}
        place={selectedMarker}
        onDismiss={dismissSheet}
        onFavorite={handleFavorite}
        isSaving={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    marginTop: 6,
    color: "#666",
    fontSize: 14,
  },
});
