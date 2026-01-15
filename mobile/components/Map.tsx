import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Button } from "react-native";
import MapView from "react-native-maps";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import CustomMarker from "./CustomMarker";
import SearchBar from "./SearchBar";

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
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [query, setQuery] = useState("");

  const sheetRef = useRef<TrueSheet>(null);

  const onMarkerPress = async (marker: any) => {
    setSelectedMarker(marker);
    await sheetRef.current?.present();
  };

  const dismissSheet = async () => {
    await sheetRef.current?.dismiss();
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
        {KINGSTON_MARKERS.map(marker => (
          <CustomMarker
            key={marker.id}
            latitude={marker.latitude}
            longitude={marker.longitude}
            selected={selectedMarker?.id === marker.id}
            onPress={() => onMarkerPress(marker)}
          />
        ))}
      </MapView>

      <SearchBar value={query} onChangeText={setQuery} />

      {/* TrueSheet */}
      <TrueSheet
        ref={sheetRef}
        detents={[0.25, 0.6]}
        onDismiss={() => setSelectedMarker(null)}
      >
        {selectedMarker && (
          <View style={styles.sheetContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{selectedMarker.title}</Text>
              <Text style={styles.description}>
                {selectedMarker.description}
              </Text>
            </View>

            <Button title="Dismiss" onPress={dismissSheet} />
          </View>
        )}
      </TrueSheet>
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
