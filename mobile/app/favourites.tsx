import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { router } from "expo-router";

type WatchItem = { id: string; name: string };
type WatchDetail = { id: string; name: string; hours: string[] };

const API_BASE = "http://YOUR_IP:8000"; // <-- change to your backend (same WiFi)

export default function Favourites() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<WatchDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // per-row fade animation values
  const fadeMap = useRef<Record<string, Animated.Value>>({}).current;

  function getFade(id: string) {
    if (!fadeMap[id]) fadeMap[id] = new Animated.Value(1);
    return fadeMap[id];
  }

  async function loadList() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/watchlist`);
      const data: WatchItem[] = await res.json();
      setItems(data);
    } catch (e) {
      setItems([
    {
      id: 5184,
      name: "23&co.",
      category: "bakery",
      address: "60 Brock St, Kingston, ON K7L 1R9, Canada",
      latitude: 44.230429799999996,
      longitude: -76.4818368,
      phone: "+1 613-544-2344",
      website: "https://23andco.ca/",
      longitude: -76.481583,
      phone: "+1 613-766-0786",
      website: "https://web.aw.ca/",
      hours: "{\"openNow\": true, \"periods\": [{\"open\": {\"day\": 0, \"hour\": 0, \"minute\": 0}}], \"weekdayDescriptions\": [\"Monday: Open 24 hours\", \"Tuesday: Open 24 hours\", \"Wednesday: Open 24 hours\", \"Thursday: Open 24 hours\", \"Friday: Open 24 hours\", \"Saturday: Open 24 hours\", \"Sunday: Open 24 hours\"]}",
      last_verified: "2026-01-15T04:33:16.334043+00:00"
    }]);
    } finally {
      setLoading(false);
    }
  }

  async function openDetails(id: string) {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/watchlist/${id}`);
      const data: WatchDetail = await res.json();
      setDetail(data);
    } catch (e) {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetails() {
    setSelectedId(null);
    setDetail(null);
  }

  async function removeWithFade(id: string) {
    // optimistic fade + remove
    Animated.timing(getFade(id), {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
      delete fadeMap[id];
    });

    // call backend (best effort)
    try {
      await fetch(`${API_BASE}/watchlist/${id}`, { method: "DELETE" });
    } catch (e) {
      // if backend fails, you could reload list instead:
      // loadList();
    }

    if (selectedId === id) closeDetails();
  }

  useEffect(() => {
    loadList();
  }, []);

  const empty = useMemo(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="star-outline" size={28} color="#6b7280" />
        <Text style={styles.emptyTitle}>No favourites yet</Text>
        <Text style={styles.emptySub}>
          Star places on the map to add them here.
        </Text>
      </View>
    );
  }, [loading]);

  return (
    <View style={styles.screen}>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: "#6b7280" }}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => x.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={empty}
          renderItem={({ item }) => (
            <Animated.View style={{ opacity: getFade(item.id) }}>
              <Pressable
                onPress={() => openDetails(item.id)}
                style={styles.card}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.placeSub}>Tap to view hours</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </Pressable>
            </Animated.View>
          )}
        />
      )}

      {/* Details Modal */}
      <Modal visible={selectedId !== null} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Pressable onPress={closeDetails} hitSlop={10} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>

              <Text style={styles.modalTitle} numberOfLines={1}>
                {detail?.name ?? "Details"}
              </Text>

              {/* Unstar button */}
              <Pressable
                onPress={() => selectedId && removeWithFade(selectedId)}
                hitSlop={10}
                style={{ padding: 6 }}
              >
                <Ionicons name="star" size={22} color="#f59e0b" />
              </Pressable>
            </View>

            <View style={{ padding: 16 }}>
              {detailLoading ? (
                <View style={styles.center}>
                  <ActivityIndicator />
                  <Text style={{ marginTop: 10, color: "#6b7280" }}>
                    Loading hours…
                  </Text>
                </View>
              ) : detail?.hours?.length ? (
                <>
                  <Text style={styles.sectionTitle}>Hours of operation</Text>
                  {detail.hours.map((line, idx) => (
                    <Text key={idx} style={styles.hoursLine}>
                      {line}
                    </Text>
                  ))}
                  <Text style={styles.tip}>
                    Tap the star to remove from favourites.
                  </Text>
                </>
              ) : (
                <Text style={{ color: "#6b7280" }}>
                  No hours available.
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 42,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backBtn: { padding: 8 },
  refreshBtn: { padding: 8, marginLeft: "auto" },
  headerTitle: {
    marginLeft: 6,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

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

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "700", color: "#111827" },
  emptySub: { marginTop: 6, fontSize: 13, color: "#6b7280", textAlign: "center", paddingHorizontal: 30 },

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
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#111827", marginBottom: 10 },
  hoursLine: { fontSize: 14, color: "#111827", paddingVertical: 3 },
  tip: { marginTop: 12, fontSize: 12, color: "#6b7280" },
});
