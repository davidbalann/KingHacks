import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { CATEGORIES, CategoryIcon } from "./CategoryIcon";
import { Place } from "@/types/place";

type CustomMarkerProps = {
  place: Place;
  latitude: number;
  longitude: number;
  selected?: boolean;
  onPress: (place: Place) => Promise<void>;
  color: string;  // Color passed as prop from Map.tsx
};

export default function CustomMarker({
  place,
  latitude,
  longitude,
  selected = false,
  onPress,
  color,
}: CustomMarkerProps) {
  if (!place) return null; // Handle case where place is null or undefined

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.5 : 1, {
      damping: 12,
      stiffness: 120,
    });
  }, [selected]);

  const item = CATEGORIES.find((cat) => cat.id === place.category);
  if (item === undefined) {
    console.log(place.category);
  }
  if (!item) return null;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={async () => await onPress(place)}
      tracksViewChanges={false}
      key={place.id.toString()}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <CategoryIcon provider={item.provider} name={item.icon} size={15} color="white" />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 5,
    borderRadius: 30,
    alignItems: "center",
    marginRight: 12,
  }
});
