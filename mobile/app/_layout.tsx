import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function TabLayout() {
  return (
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
  );
}
