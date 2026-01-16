import React, { useRef, useState } from "react";
import { View, StyleSheet, Keyboard } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import CustomMarker from "./CustomMarker";
import PlaceSheet from "./PlaceSheet";
import { Place } from "@/types/place";
import { useEffect } from "react";
import { nearbyLocations } from "@/api/nearbyLocations";
import SearchSheet from "./SearchSheet";
import { useFocusEffect } from "@react-navigation/native";
import { searchPlaces } from "@/api/search";
import { savePlace } from "@/api/favourite";
import { useLocalSearchParams } from "expo-router";
import { getPlaceById } from "@/api/favourite";

export default function Map() {
  const { id } = useLocalSearchParams<{ id?: string }>();

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

  const onFavorite = async () => {
    console.log(selectedMarker);
    await savePlace(selectedMarker);
  }

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
      let isActive = true;

      const handleInitialPlace = async () => {
        if (!id) {
          // No param → normal behavior
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

        setSelectedMarker(place);
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
      showsPointsOfInterest={false}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 44.2312,
          longitude: -76.486,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {places.map(place => (
          <Marker icon={require('@/assets/images/markers/greenHouse.png')} onPress={onSelectPlace} key={place.id} coordinate={{latitude: place.latitude, longitude: place.longitude}} pinColor={"blue"}>

          </Marker>

        ))}
      </MapView>
      <TrueSheet name="place" detents={[0.35, 1]} onDidDismiss={() => TrueSheet.present('search')}>
        <PlaceSheet
          place={selectedMarker}
          onDismiss={dismissSheet}
          onFavorite={onFavorite}
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

