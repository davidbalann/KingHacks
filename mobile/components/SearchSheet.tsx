import React, {
  useState,
  useRef,
} from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Place } from "@/types/place";
import Results from "./Results";
import Categories from "./Categories";

interface SearchSheetProps {
  onSelectPlace: (place: Place) => void;
  onSelectCategory: (category: string) => Promise<void>;
}

export default function SearchSheet({onSelectPlace, onSelectCategory} : SearchSheetProps) {
    const [query, setQuery] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const [sheetExpanded, setSheetExpanded] = useState(false);

    const focused = inputFocused || sheetExpanded;

    const handleFocus = async () => {
      setInputFocused(true);
      await TrueSheet.resize('search', 1);
    };

    const handleBlur = () => {
      setInputFocused(false);
    };

    return (
      <>
        <View style={styles.searchContainer}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Search places..."
              placeholderTextColor="#2f2f2fff"
              style={styles.input}
            />
          </View>
        {focused && query ? (
          <Results query={query} onSelectPlace={onSelectPlace} />
        ) : (
          <Categories onSelectCategory={onSelectCategory} />
        )}
      </>
    );
  }

const styles = StyleSheet.create({
  searchContainer: {
    margin: 15,
  },
  input: {
    padding: 12,
    fontSize: 16,
    color: "black",
    backgroundColor: "#eeeeeeff",
    borderRadius: 20,
  },
});
