import { getSavedPlaces } from "@/api/favourite";
import { Place } from "@/types/place";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Favorites() {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    getSavedPlaces().then(setPlaces);
  }, []);

  if (places.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>
          Save places to see them here
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={places}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          return (
            <Pressable style={styles.card} onPress={() => {router.push('/')}}>
              <View style={styles.header}>
                <Text style={styles.name}>{item.name}</Text>
              </View>

              <Text style={styles.address}>{item.address}</Text>

              <Text style={styles.meta}>
                {item.category}
              </Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  address: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "capitalize",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
});

