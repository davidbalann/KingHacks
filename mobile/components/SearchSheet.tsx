import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, StyleSheet, Keyboard } from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Place } from "@/types/place";
import Results from "./Results";
import Categories from "./Categories";

interface SearchSheetProps {
  onSelectPlace: (place: Place) => void;
}

export default function SearchSheet({ onSelectPlace }: SearchSheetProps) {
  const sheetRef = useRef<TrueSheet>(null);
  const [query, setQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const focused = inputFocused || sheetExpanded;

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

  return (
    <TrueSheet
      ref={sheetRef}
      scrollable={true}
      detents={[0.085, 1]}
      dimmed={false}
      initialDetentIndex={0}
      onDetentChange={(event) => {
        const index = event.nativeEvent.index;
        const expanded = index > 0.5;

        setSheetExpanded(expanded);

        if (!expanded) {
            setQuery("");
            Keyboard.dismiss();
        }
      }}
      header={
        <View style={styles.searchContainer}>
            <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search places..."
            placeholderTextColor={"#2f2f2fff"}
            style={styles.input}
            />
        </View>
      }
    >
      {focused && query ? <Results query={query}/> : <Categories />}
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
