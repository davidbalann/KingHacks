import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { CATEGORIES, CategoryIcon } from "./CategoryIcon";

interface CategoryProps {
  onSelectCategory: (category: string) => Promise<void>;
}

export default function Categories({onSelectCategory}: CategoryProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => onSelectCategory(item.id)}>
            <View style={styles.iconContainer}>
              <CategoryIcon
                provider={item.provider}
                name={item.icon}
                size={20}
                color="white"
              />
            </View>

            <Text style={styles.label}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconContainer: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 30,
    alignItems: "center",
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E5EA",
    marginLeft: 60,
  },
});
