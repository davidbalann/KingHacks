import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerTransparent: true, headerTitle: '', 
          headerRight: () => 
          <Pressable onPress={() => router.push('/chat')}>
            <Ionicons name='chatbox' size={20} style={{ marginLeft: 7 }}/>  
          </Pressable>,
          headerLeft: () => 
          <Pressable onPress={() => router.push('/favourites')}>
            <FontAwesome name='star-o' size={20} style={{ marginLeft: 8 }}/>  
          </Pressable> }} 
        />
        <Stack.Screen name="chat" options={{ headerTransparent: true, headerTitle: 'Chat' }} />
        <Stack.Screen name="favourites" options={{ headerTransparent: true, headerTitle: 'Favorites' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}