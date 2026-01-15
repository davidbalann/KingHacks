import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}
