import React, { useRef, useState } from "react";
import { View, StyleSheet, Keyboard } from "react-native";
import MapView from "react-native-maps";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import CustomMarker from "./CustomMarker";
import PlaceSheet from "./PlaceSheet";
import { Place } from "@/types/place";
import { useEffect } from "react";
import { nearbyLocations } from "@/api/nearbyLocations";
import SearchSheet from "./SearchSheet";
import { useFocusEffect } from "@react-navigation/native";
import { searchPlaces } from "@/api/search";

export default function Map() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const [selectedMarker, setSelectedMarker] = useState<Place>(null);

  const onMarkerPress = async (marker: Place) => {
    setSelectedMarker(marker);
    await TrueSheet.present('place');
  };

  const onSelectPlace = async (place: Place) => {
    setSelectedMarker(place);
    await TrueSheet.present('place');
  }

  const onSelectCategory = async (category: string) => {
    const resultPlaces = await searchPlaces(category);
    setPlaces(resultPlaces);
    await dismissSheet();
  }

  const dismissSheet = async () => {
    await TrueSheet.dismiss('place');
    setSelectedMarker(null);
    await TrueSheet.present('search');
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
            place={place}
            latitude={place.latitude}
            longitude={place.longitude}
            selected={selectedMarker?.id === place.id}
            onPress={() => onMarkerPress(place)}
          />
        ))}
      </MapView>
      <TrueSheet name="place" detents={[0.35, 1]} onDidDismiss={() => TrueSheet.present('search')}>
        <PlaceSheet
          place={selectedMarker}
          onDismiss={dismissSheet}
          onFavorite={() => {console.log(`favorite ${selectedMarker?.name}`)}}
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

          //setSheetExpanded(expanded);

          if (!expanded) {
            //setQuery("");
            Keyboard.dismiss();
          }
        }}
      >
        <SearchSheet onSelectPlace={onSelectPlace} onSelectCategory={onSelectCategory}/>
      </TrueSheet>
    </View>
  );
}

