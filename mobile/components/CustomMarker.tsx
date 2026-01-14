import React, { useEffect } from "react";
import { Marker } from "react-native-maps";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

type CustomMarkerProps = {
  latitude: number;
  longitude: number;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function CustomMarker({
  latitude,
  longitude,
  color = "#4F46E5",
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <Animated.View
        style={[
          {
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: color,
            borderWidth: 2,
            borderColor: "white",
          },
          animatedStyle,
        ]}
      />
    </Marker>
  );
}
