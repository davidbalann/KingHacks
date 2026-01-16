import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CATEGORIES: Category[] = [
  /*
  Bakeries
Charging Station
Shelters
Drop-in centers
Meal programs
Housing services
Health Service
Warm up/Cool down Sites
Washroom/shower*/
  { id: "1", name: "Restaurants", icon: "restaurant-outline" },
  { id: "2", name: "Coffee", icon: "cafe-outline" },
  { id: "3", name: "Bars", icon: "wine-outline" },
  { id: "4", name: "Shopping", icon: "bag-outline" },
  { id: "5", name: "Parks", icon: "leaf-outline" },
  { id: "6", name: "Gyms", icon: "barbell-outline" },
];

export default function Categories() {
  return (
    <View style={styles.container}>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <Pressable style={styles.row}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={20} color="#111" />
            </View>

            <Text style={styles.label}>{item.name}</Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#C7C7CC"
            />
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
    width: 32,
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
