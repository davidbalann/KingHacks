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
  onPress: (place: Place) => Promise<void>;
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
    <View style={[styles.iconContainer, { backgroundColor: getHoursColor(place.hours) }]}>
      <CategoryIcon
        provider={item.provider}
        name={item.icon}
        size={15}
        color="white"
      />
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

function getHoursColor(hours?: {
  openNow?: boolean;
  nextCloseTime?: string;
}) {
  // Closed or missing data
  if (!hours?.openNow) {
    return "#9CA3AF"; // gray (THIS NEEDS TO CHANGE COLOURS)
  }

  // If we don't know the close time, treat as open
  if (!hours.nextCloseTime) {
    return "#16A34A"; // green
  }

  const now = new Date();
  const closeTime = new Date(hours.nextCloseTime);

  const minutesUntilClose =
    (closeTime.getTime() - now.getTime()) / 1000 / 60;

  if (minutesUntilClose <= 30 && minutesUntilClose > 0) {
    return "#FACC15"; // yellow (closing soon)
  }

  return "#16A34A"; // green (open)
}
