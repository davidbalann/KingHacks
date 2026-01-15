import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
//import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Place } from "@/types/place";
import { searchPlaces } from "@/api/search";

type Props = {
  sheetRef: React.RefObject<any>;
  query: string;
  onSelectPlace: (place: Place) => void;
};

export default function SearchResultsSheet({
  sheetRef,
  query,
  onSelectPlace,
}: Props) {
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!query.trim()) {
        setResults([]);
        return;
    }

    setLoading(true);

    (async () => {
        try {
        const data = await searchPlaces(1, 20);

        if (!cancelled) {
            const filtered = data.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase())
            );

            setResults(filtered);
            console.log(results);
        }
        } catch (err) {
        console.error("Search failed", err);
        if (!cancelled) setResults([]);
        } finally {
        if (!cancelled) setLoading(false);
        }
    })();

    return () => {
        cancelled = true;
    };
    }, [query]);


  return (
   
      <View style={styles.container}>
        <Text style={styles.title}>
          Results for “{query}”
        </Text>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => onSelectPlace(item)}
              >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.category} · {item.address}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                No places found
              </Text>
            }
          />
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  meta: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  empty: {
    marginTop: 24,
    textAlign: "center",
    color: "#999",
  },
});
