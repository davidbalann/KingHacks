// PickupsList.tsx
import React from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";

export const SAMPLE_PICKUPS = {
  groceries: [
    {
      id: "1",
      name: "Starbucks",
      address: "69 Union St, Kingston",
      otherDetails: "Sandwitches available",
      details: "Closes at 7 PM",
      imageUrl: "https://lh3.googleusercontent.com/p/AF1QipP7cU_cFfs0ISH1rC1vQysF1wbHGNy6KAxw-aoR=w408-h408-k-no",
    },
    {
      id: "2",
      name: "Tim Hortons",
      address: "76 Stuart St",
      details: "Closes at 11 PM",
      otherDetails: "Hot coffee and bagels available",
      imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSx7ZZv5B6nhflQ38M8JcAGT95MekhAGRDCrhneCfw3jZT70ETi5bVDGxwQ0l_gHGqrxWdDGLUoln8aIqk9N-vdRflJyQckRaK1LrOTZ9M3SIg8GScF3jXNvecaTxiCrreHVrtoL17RWVuLb=w408-h541-k-no",
    },
  ],
  bakery: [
    {
      id: "3",
      name: "Sweet Bakes",
      address: "789 Pine Rd",
      imageUrl: "https://example.com/sweet-bakes.jpg",
    },
  ],
};

interface Pickup {
  id: string;
  name: string;
  address: string;
  details?: string;
  imageUrl: string;
}

interface PickupsListProps {
  pickups: Pickup[];
}

export default function PickupsList({ pickups }: PickupsListProps) {
  return (
    <FlatList
      data={pickups}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={() => (
        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16, }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111" }}>Available Pickups</Text>
        </View>
        )}

      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address}>{item.address}</Text>
            {item.details && <Text style={styles.details}>{item.details}</Text>}
            {item.otherDetails && <Text style={styles.details}>{item.otherDetails}</Text>}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  address: {
    fontSize: 14,
    color: "#292929ff",
    marginTop: 2,
  },
  details: {
    fontSize: 14,
    color: "#6c6c6cff",
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 16,
  },
});
