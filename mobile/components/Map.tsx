import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import CustomMarker from "./CustomMarker";

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
    longitude: -76.4860,
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
  const [selectedMarker, setSelectedMarker] = useState(
    KINGSTON_MARKERS[0] // selected by default
  );

  const onMarkerPress = (marker: any) => {
    setSelectedMarker(marker);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 44.2312,
          longitude: -76.4860,
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

      {/* Overlay card */}
      {selectedMarker && (
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{selectedMarker.title}</Text>
            <Text style={styles.description}>
              {selectedMarker.description}
            </Text>
          </View>

          <Pressable onPress={() => setSelectedMarker(null)}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    marginTop: 4,
    color: "#666",
  },
  close: {
    fontSize: 18,
    paddingLeft: 12,
    color: "#999",
  },
});
