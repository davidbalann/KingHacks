import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Keyboard, Alert } from "react-native";
import MapView from "react-native-maps";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import CustomMarker from "./CustomMarker";
import PlaceSheet from "./PlaceSheet";
import { Place } from "@/types/place";
import { nearbyLocations } from "@/api/nearbyLocations";
import SearchSheet from "./SearchSheet";
import { useFocusEffect } from "@react-navigation/native";
import { searchPlaces } from "@/api/search";
import { savePlace } from "@/api/favourite";
import { useLocalSearchParams } from "expo-router";
import { getPlaceById } from "@/api/favourite";
import { getStatusForPlaceId, statusToColor } from "@/components/placeStatus"; // Import status helper

export default function Map() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const mapRef = useRef<MapView>(null);

  const userRegionRef = useRef<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 44.2312,
    longitude: -76.486,
  });

  const [selectedMarker, setSelectedMarker] = useState<Place | null>(null);

  const onSelectPlace = async (place: Place) => {
    newSetSelectedMarker(place);
    await TrueSheet.present("place");
  };

  const newSetSelectedMarker = async (place: Place | null) => {
    setSelectedMarker(place);

    if (!mapRef.current) return;

    if (!place) {
      // Zoom out to user's location
      const { latitude, longitude } = userRegionRef.current;
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        400
      );
      return;
    }

    // Zoom into selected place
    mapRef.current.animateToRegion(
      {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      350
    );
  };

  const onSelectCategory = async (category: string) => {
    const resultPlaces = await searchPlaces("", category);
    setPlaces(resultPlaces);
    await dismissSheet();
  };

  const dismissSheet = async () => {
    await TrueSheet.dismiss("place");
    await newSetSelectedMarker(null);
    await TrueSheet.present("search");
  };

  const onFavorite = async () => {
    if (!selectedMarker) return;
    await savePlace(selectedMarker);
    Alert.alert(`${selectedMarker.name} is saved to favorites`)
  };

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
      let isActive = true;
      const handleInitialPlace = async () => {
        if (!id) {
          await TrueSheet.present("search");
          return;
        }

        const placeId = Number(id);
        if (Number.isNaN(placeId)) {
          await TrueSheet.present("search");
          return;
        }

        const place = await getPlaceById(placeId);

        if (!place || !isActive) {
          await TrueSheet.present("search");
          return;
        }

        newSetSelectedMarker(place);
        await TrueSheet.present("place");
      };

      handleInitialPlace();

      return () => {
        isActive = false;
        TrueSheet.dismissAll();
        setSelectedMarker(null);
      };
    }, [id])
  );

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        showsUserLocation={true}
        onUserLocationChange={(e) => {
          const coordinate = e.nativeEvent.coordinate;
          if (!coordinate) return;
          const { latitude, longitude } = coordinate;
          userRegionRef.current = { latitude, longitude };
        }}
        showsPointsOfInterest={false}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 44.2312,
          longitude: -76.486,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {places.map((place) => {
          const status = getStatusForPlaceId(place.id); // Get random status for each place
          const bgColor = statusToColor(status); // Get color for marker
          return (
            <CustomMarker
              key={place.id}
              onPress={onSelectPlace}
              place={place}
              latitude={place.latitude}
              longitude={place.longitude}
              color={bgColor} // Pass the color to CustomMarker
            />
          );
        })}
      </MapView>

      <TrueSheet name="place" detents={[0.35, 1]} onDidDismiss={() => TrueSheet.present("search")}>
        <PlaceSheet
          place={selectedMarker}
          onDismiss={dismissSheet}
          onFavorite={async () => await onFavorite()}
        />
      </TrueSheet>

      <TrueSheet
        name="search"
        scrollable
        detents={[0.077, 1]}
        dimmed={false}
        initialDetentIndex={0}
        onDetentChange={(event) => {
          const index = event.nativeEvent.index;
          const expanded = index > 0.5;
          if (!expanded) {
            Keyboard.dismiss();
          }
        }}
      >
        <SearchSheet onSelectPlace={onSelectPlace} onSelectCategory={onSelectCategory} />
      </TrueSheet>
    </View>
  );
}
