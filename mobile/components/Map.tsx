import React, { useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import CustomMarker from "./CustomMarker";
import PlaceSheet from "./PlaceSheet";
import { Place } from "@/types/place";
import { useEffect } from "react";
import { nearbyLocations } from "@/api/nearbyLocations";
import SearchSheet from "./SearchSheet";
import { useFocusEffect } from "@react-navigation/native";
import { addToWatchlist } from "@/api/watchlist";

export default function Map() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const [selectedMarker, setSelectedMarker] = useState<Place>(null);

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

  useEffect(() => {
    const loadNearby = async () => {
      try {
        setLoadingPlaces(true);

        const results = await nearbyLocations(
          44.2312,
          -76.486
        );

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
      try {
        TrueSheet.present('search');
      } catch {
        console.log('error')
      }
        

      return () => {
        TrueSheet.dismissAll();
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

      <PlaceSheet
        sheetRef={placeSheetRef}
        place={selectedMarker}
        onDismiss={dismissSheet}
        onFavorite={async () => {await addToWatchlist(selectedMarker?.id)}}
      />
      <SearchSheet ref={searchSheetRef} places={[]} recentSearches={[]} onSelectPlace={(place: Place) => console.log(place)}/>
    </View>
  );
}

