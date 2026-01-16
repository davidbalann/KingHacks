import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import {
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { CATEGORIES, CategoryIcon } from "./CategoryIcon";
import { Place } from "@/types/place";

type CustomMarkerProps = {
  place: Place;
  latitude: number;
  longitude: number;
  selected?: boolean;
  onPress?: () => void;
};

export default function CustomMarker({
  place,
  latitude,
  longitude,
  selected = false,
  onPress,
}: CustomMarkerProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.5 : 1, {
      damping: 12,
      stiffness: 120,
    });
  }, [selected]);

  const item = CATEGORIES.find((cat) => cat.id === place.category);
  console.log(item);
  if (!item) return null;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={onPress}
      tracksViewChanges={false}
    > 
    <View style={styles.iconContainer}>
      <CategoryIcon
        provider={item.provider}
        name={item.icon}
        size={15}
        color={place.hours?.openNow ? "white" : "black"}
      />
    </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 5,
    backgroundColor: 'green',
    borderRadius: 30,
    alignItems: "center",
    marginRight: 12,
  }
});
