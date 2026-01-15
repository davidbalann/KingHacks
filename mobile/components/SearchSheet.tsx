import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Keyboard } from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Place } from "@/types/place";

interface SearchSheetProps {
  onSelectPlace: (place: Place) => void;
}

export default function SearchSheet({ onSelectPlace }: SearchSheetProps) {
  const sheetRef = useRef<TrueSheet>(null);
  const [query, setQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const focused = inputFocused || sheetExpanded;

  // Present sheet small on mount
  useEffect(() => {
    sheetRef.current?.present();
  }, []);

  const handleFocus = async () => {
    setInputFocused(true);
    await sheetRef.current?.resize(1);
  };

  const handleBlur = () => {
    setInputFocused(false);
  };

  //const dataToRender = query.trim().length > 0 ? results : suggested;

  return (
      <View>
      {focused && query &&(
          <FlatList
            data={[]}
            keyExtractor={(item, index) => `${index}`}
            renderItem={({ item }) => (
              <Pressable style={styles.item}>
                <Text>{item}</Text>
              </Pressable>
            )}
          />
      )}
      </View>
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
