import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { Place } from "@/types/place";
import { searchPlaces } from "@/api/search";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { TrueSheet } from "@lodev09/react-native-true-sheet";

interface ResultsProps {
  query: string
  onSelectPlace: (place: Place) => void;
}

export default function Results({ query, onSelectPlace }: ResultsProps) {
  const debouncedQuery = useDebouncedValue(query, 300);

  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    // ⏳ Delay spinner to avoid flicker
    loadingTimer.current = setTimeout(() => {
      if (!cancelled) setLoading(true);
    }, 150);

    const runSearch = async () => {
      try {
        setError(null);
        const data = await searchPlaces(query);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setError("Something went wrong");
      } finally {
        if (!cancelled) {
          setLoading(false);
          if (loadingTimer.current) clearTimeout(loadingTimer.current);
        }
      }
    };

    runSearch();

    return () => {
      cancelled = true;
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
    };
  }, [debouncedQuery]);

  if (loading && results.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!loading && debouncedQuery && results.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No results found</Text>
      </View>
    );
  }

  return (
    <FlatList
      nestedScrollEnabled
      data={results}
      keyExtractor={(item) => item.id.toString()}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <Pressable
          style={styles.item}
          onPress={async () => {await TrueSheet.dismiss('search'); onSelectPlace(item)}}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.category} • {item.address}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    padding: 24,
    alignItems: "center",
  },
  empty: {
    color: "#666",
    fontSize: 14,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
