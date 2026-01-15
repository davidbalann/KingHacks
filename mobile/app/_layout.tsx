<<<<<<< HEAD
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { KeyboardProvider } from "react-native-keyboard-controller";
=======
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
>>>>>>> origin/setup-chat

export default function Layout() {
  return (
<<<<<<< HEAD
    <KeyboardProvider>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Label>Home</Label>
          <Icon sf="house.fill" drawable="custom_android_drawable" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="chat">
          <Label>Chat</Label>
          <Icon sf="house.fill" drawable="custom_android_drawable" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </KeyboardProvider>
=======
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
>>>>>>> origin/setup-chat
  );
}
