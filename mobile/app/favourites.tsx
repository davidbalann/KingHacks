import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  getFavourites,
  removeFavourite,
  FavouritePlace,
} from "@/storage/favourites";

export default function Favourites() {
  const [items, setItems] = useState<FavouritePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FavouritePlace | null>(null);

  const fadeMap = useRef<Record<string, Animated.Value>>({}).current;

  function fadeFor(id: string) {
    if (!fadeMap[id]) fadeMap[id] = new Animated.Value(1);
    return fadeMap[id];
  }

  async function loadList() {
    setLoading(true);
    try {
      const data = await getFavourites();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  function openDetails(place: FavouritePlace) {
    setSelected(place);
  }

  function closeDetails() {
    setSelected(null);
  }

  function getWeekdayDescriptions(place: FavouritePlace): string[] {
    if (!place.hours) return [];
    try {
      const obj = JSON.parse(place.hours);
      return obj.weekdayDescriptions ?? [];
    } catch {
      return [];
    }
  }

  async function removeWithFade(id: string) {
    Animated.timing(fadeFor(id), {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setItems((prev) => prev.filter((x) => String(x.id) !== id));
      delete fadeMap[id];
    });

    await removeFavourite(Number(id));

    if (selected && String(selected.id) === id) closeDetails();
  }

  useFocusEffect(
    React.useCallback(() => {
      loadList();
    }, [])
  );

  return (
    <View style={styles.screen}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: "#6b7280" }}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => String(x.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="star-outline" size={28} color="#6b7280" />
              <Text style={styles.emptyTitle}>No favourites yet</Text>
              <Text style={styles.emptySub}>
                Star places on the map to add them here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const idStr = String(item.id);
            return (
              <Animated.View style={{ opacity: fadeFor(idStr) }}>
                <Pressable onPress={() => openDetails(item)} style={styles.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.placeName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.placeSub}>Tap to view hours</Text>
                  </View>

                  <Pressable
                    onPress={() => removeWithFade(idStr)}
                    hitSlop={10}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="star" size={20} color="#f59e0b" />
                  </Pressable>
                </Pressable>
              </Animated.View>
            );
          }}
        />
      )}

      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Pressable
                onPress={closeDetails}
                hitSlop={10}
                style={{ padding: 6 }}
              >
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>

              <Text style={styles.modalTitle} numberOfLines={1}>
                {selected?.name ?? "Details"}
              </Text>

              <Pressable
                onPress={() => selected && removeWithFade(String(selected.id))}
                hitSlop={10}
                style={{ padding: 6 }}
              >
                <Ionicons name="star" size={22} color="#f59e0b" />
              </Pressable>
            </View>

            <View style={{ padding: 16 }}>
              <Text style={styles.sectionTitle}>Hours of operation</Text>

              {selected ? (
                getWeekdayDescriptions(selected).length ? (
                  getWeekdayDescriptions(selected).map((line, idx) => (
                    <Text key={idx} style={styles.hoursLine}>
                      {line}
                    </Text>
                  ))
                ) : (
                  <Text style={{ color: "#6b7280" }}>No hours available.</Text>
                )
              ) : null}

              <Text style={styles.tip}>
                Tap the star to remove from favourites.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    marginBottom: 12,
  },
  placeName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  placeSub: { marginTop: 4, color: "#6b7280", fontSize: 13 },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 30,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  hoursLine: { fontSize: 14, color: "#111827", paddingVertical: 3 },
  tip: { marginTop: 12, fontSize: 12, color: "#6b7280" },
});
