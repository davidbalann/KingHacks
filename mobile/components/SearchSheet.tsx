import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Keyboard } from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Place } from "@/types/place";

interface SearchSheetProps {
  places: Place[];
  recentSearches: string[];
  onSelectPlace: (place: Place) => void;
}

export default function SearchSheet({ places, recentSearches, onSelectPlace }: SearchSheetProps) {
  const sheetRef = useRef<TrueSheet>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  // Present sheet small on mount
  useEffect(() => {
    sheetRef.current?.present();
  }, []);

  const handleFocus = async () => {
    setFocused(true);
    await sheetRef.current?.resize(1); // expand to full screen
  };

  const handleDismiss = async () => {
    setFocused(false);
    setQuery("");
    Keyboard.dismiss();
    await sheetRef.current?.resize(0); // shrink back to small
  };

  return (
    <TrueSheet
      ref={sheetRef}
      detents={['auto', 1]}
      dimmed={false}
      initialDetentIndex={0}
      header={
        <View style={styles.searchContainer}>
            <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={handleFocus}
            placeholder="Search places..."
            placeholderTextColor={"#2f2f2fff"}
            style={styles.input}
            />
      </View>
      }
    >
      {/* Only show lists if expanded */}
      {focused && (
        <View style={{ flex: 1, marginTop: 16 }}>
          {/* Recent Searches */}
          <FlatList
            data={recentSearches.filter(r => r.toLowerCase().includes(query.toLowerCase()))}
            keyExtractor={(item, index) => `recent-${index}`}
            ListHeaderComponent={() => <Text style={styles.title}>Recent Searches</Text>}
            renderItem={({ item }) => (
              <Pressable style={styles.item}>
                <Text>{item}</Text>
              </Pressable>
            )}
          />

          {/* Suggested Places */}
          <FlatList
            data={places.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={() => <Text style={[styles.title, { marginTop: 24 }]}>Suggested Places</Text>}
            renderItem={({ item }) => (
              <Pressable style={styles.item} onPress={() => onSelectPlace(item)}>
                <Text>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </TrueSheet>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    margin: 15
  },
  input: {
    padding: 12,
    fontSize: 16,
    color: 'black',
    backgroundColor: '#eeeeeeff',
    borderRadius: 20
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  category: {
    color: "#666",
    fontSize: 12,
  },
});
