import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import MapView from "react-native-maps";
import { TrueSheet } from "@lodev09/react-native-true-sheet";

import CustomMarker from "./CustomMarker";
import PlaceSheet from "./PlaceSheet";
import SearchSheet from "./SearchSheet";

import { Place } from "@/types/place";
import { nearbyLocations } from "@/api/nearbyLocations";
import { useFocusEffect } from "@react-navigation/native";
import { API_BASE_URL } from "@/constants";

import { addFavourite } from "@/storage/favourites";

export default function Map() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const [selectedMarker, setSelectedMarker] = useState<Place | null>(null);

  const searchSheetRef = useRef<TrueSheet>(null);
  const placeSheetRef = useRef<TrueSheet>(null);

  const onMarkerPress = async (marker: Place) => {
    setSelectedMarker(marker);
    await placeSheetRef.current?.present();
  };

  const dismissSheet = async () => {
    await placeSheetRef.current?.dismiss();
    setSelectedMarker(null);
  };

  async function addPlaceToWatchlist(place: Place) {
    const payload = {
      service_id: String(place.id),
      name: (place as any).title ?? (place as any).name ?? "Unknown place",
      latitude: (place as any).latitude,
      longitude: (place as any).longitude,
      hours: (place as any).hours ?? null, // can be object OR string, favourites can parse
    };

    const res = await fetch(`${API_BASE_URL}/watchlist/add?user_id=5`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();   // <-- await it
      throw new Error(`${res.status}: ${text}`);
    }
  }

  useEffect(() => {
    const loadNearby = async () => {
      try {
        setLoadingPlaces(true);
        const results = await nearbyLocations(44.2312, -76.486);
        setPlaces(results);
      } catch (err) {
        console.error("Failed to load nearby places", err);
      } finally {
        setLoadingPlaces(false);
      }
    };

    loadNearby();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const t = setTimeout(() => {
        searchSheetRef.current?.present();
      }, 0);

      return () => {
        clearTimeout(t);
        searchSheetRef.current?.dismiss();
        placeSheetRef.current?.dismiss();
        setSelectedMarker(null);
      };
    }, [])
  );


  return (
    <View style={{ flex: 1 }}>
      <MapView
        showsPointsOfInterest={false}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 44.2312,
          longitude: -76.486,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {places.map((place) => (
          <CustomMarker
            key={String(place.id)}
            latitude={(place as any).latitude}
            longitude={(place as any).longitude}
            selected={selectedMarker?.id === place.id}
            onPress={() => onMarkerPress(place)}
          />
        ))}
      </MapView>

      <PlaceSheet
        sheetRef={placeSheetRef}
        place={selectedMarker}
        onDismiss={dismissSheet}
        onFavorite={async () => {
          if (!selectedMarker) return;

          await addFavourite({
            id: Number((selectedMarker as any).id),
            name: (selectedMarker as any).name ?? (selectedMarker as any).title ?? "Unknown",
            category: (selectedMarker as any).category,
            address: (selectedMarker as any).address,
            latitude: Number((selectedMarker as any).latitude),
            longitude: Number((selectedMarker as any).longitude),
            hours: (selectedMarker as any).hours, // keep as string
          });

          Alert.alert("Saved", "Added to favourites.");
        }}

      />

      <SearchSheet
        ref={searchSheetRef}
        places={places}
        recentSearches={[]}
        onSelectPlace={(place: Place) => onMarkerPress(place)}
      />
    </View>
  );
}
