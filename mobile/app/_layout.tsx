import { Feather, Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Pressable } from 'react-native';
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function TabLayout() {
  return (
    <KeyboardProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerTransparent: true, headerTitle: '', 
          headerRight: () => 
          <Pressable>
            <Ionicons name='chatbox' size={20} style={{ marginLeft: 7 }}/>  
          </Pressable>,
          headerLeft: () => 
          <Pressable>
            <Feather name='list' size={20} style={{ marginLeft: 6 }}/>  
          </Pressable> }} 
        />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
      </Stack>
    </KeyboardProvider>
  );
}
