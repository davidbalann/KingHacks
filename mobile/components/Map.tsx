<<<<<<< HEAD
import React, { useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView from "react-native-maps";
//import { TrueSheet } from "@lodev09/react-native-true-sheet";
import CustomMarker from "./CustomMarker";
import PlaceSheet from "./PlaceSheet";
import { Place } from "@/types/place";
import SearchResultsSheet from "./SearchResultsSheet";
=======
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Button } from "react-native";
import MapView from "react-native-maps";
import CustomMarker from "./CustomMarker";
import SearchBar from "./SearchBar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
>>>>>>> origin/setup-chat

const MAP_STYLE = [{ featureType: "poi", stylers: [{ visibility: "off" }] }];



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

<<<<<<< HEAD
  const placeSheetRef = useRef<any>(null);
  const searchSheetRef = useRef<any>(null);

  const onSearchFocus = async () => {
    await searchSheetRef.current?.present();
  };

  const onSelectSearchResult = async (place: Place) => {
    await searchSheetRef.current?.dismiss();
    setSelectedMarker(place);
    await placeSheetRef.current?.present();
  };

  const places = [];

  const onMarkerPress = async (marker: Place) => {
    setSelectedMarker(marker);
    await placeSheetRef.current?.present();
  };

  const dismissSheet = async () => {
    await placeSheetRef.current?.dismiss();
=======
  const onMarkerPress = async (marker: any) => {
    setSelectedMarker(marker);
  };

  const dismissSheet = async () => {
>>>>>>> origin/setup-chat
    setSelectedMarker(null);
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
<<<<<<< HEAD
        {places.map(place => (
=======
        {KINGSTON_MARKERS.map((marker) => (
>>>>>>> origin/setup-chat
          <CustomMarker
            key={place.id}
            latitude={place.latitude}
            longitude={place.longitude}
            selected={selectedMarker?.id === place.id}
            onPress={() => onMarkerPress(place)}
          />
        ))}
      </MapView>

      <SearchResultsSheet
        sheetRef={searchSheetRef}
        query={query}
        onSelectPlace={onSelectSearchResult}
      />

<<<<<<< HEAD
      <PlaceSheet
        sheetRef={placeSheetRef}
        place={selectedMarker}
        onDismiss={dismissSheet}
        onFavorite={() => {console.log(`favorite ${selectedMarker?.name}`)}}
      />
=======
      {/* Chat Button */}
      <Pressable
        style={{ position: "absolute", top: 100, right: 20 }}
        onPress={() => router.push("/chat")}
      >
        <Ionicons name="chatbubbles" size={36} color="white" />
      </Pressable>

      {/* Favourites List Button */}
      <Pressable
        style={{ position: "absolute", top: 160, right: 20 }}
        onPress={() => router.push("/favourites")}
      >
        <Ionicons name="star" size={36} color="white" />
      </Pressable>
>>>>>>> origin/setup-chat
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
