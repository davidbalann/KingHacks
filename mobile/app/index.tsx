import { StyleSheet, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const INITIAL_REGION = {
  latitude: 44.28,
  longitude: -76.51,
  latitudeDelta: 1,
  longitudeDelta: 1
}

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MapView 
        style={StyleSheet.absoluteFill} 
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        />
    </View>
  );
}
