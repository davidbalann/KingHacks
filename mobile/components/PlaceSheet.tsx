import React from "react";
import { View, Text, StyleSheet, Pressable, Linking } from "react-native";
//import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Ionicons } from "@expo/vector-icons";
import { Place } from "@/types/place";

type Props = {
  sheetRef: React.RefObject<any>;
  place: Place | null;
  onDismiss: () => void;
  onFavorite: () => void;
  isSaving?: boolean;
};

export default function PlaceSheet({
  sheetRef,
  place,
  onDismiss,
  onFavorite,
  isSaving = false,
}: Props) {
  if (!place) return null;

  const isOpen = place.hours?.openNow;

  return (
    //<TrueSheet ref={sheetRef} detents={[0.35, 1]} onDismiss={onDismiss}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 32 }} />
          <Text style={styles.title} numberOfLines={1}>
            {place.name}
          </Text>

          <Pressable onPress={onDismiss} hitSlop={10}>
            <Ionicons name="close" size={22} />
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <ActionButton
            icon="walk"
            label={`${place.walkingTime ?? "—"} min`}
            onPress={() => {}}
            primary
          />

          {place.phone && (
            <ActionButton
              icon="call"
              label="Call"
              onPress={() => {console.log(place.phone); Linking.openURL(`tel:${place.phone}`)}}
            />
          )}

          {place.website && (
            <ActionButton
              icon="globe-outline"
              label="Website"
              onPress={() => Linking.openURL(place.website)}
            />
          )}
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
            <View>
            <Text>Hours</Text>
            <Text
                style={[
                styles.infoText,
                { color: isOpen ? "#2ecc71" : "#e74c3c" },
                ]}
            >
                {isOpen ? "Open" : "Closed"}
            </Text>
          </View>

          {place.distance && (
            <Text style={styles.infoText}>• {place.distance}</Text>
          )}
        </View>

        {/* Address */}
        <Text style={styles.address}>{place.address}</Text>

        {/* Favorite */}
        <Pressable
          style={styles.favorite}
          onPress={onFavorite}
          disabled={isSaving}
        >
          <Ionicons name="star-outline" size={20} />
          <Text style={styles.favoriteText}>
            {isSaving ? "Saving..." : "Add to Favorites"}
          </Text>
        </Pressable>
      </View>
    //</TrueSheet>
  );
}

/* ---------- Small Action Button ---------- */

function ActionButton({
  icon,
  label,
  onPress,
  primary,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionButton,
        primary && styles.primaryButton,
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={primary ? "#fff" : "#007AFF"}
      />
      <Text
        style={[
          styles.actionLabel,
          primary && { color: "#fff" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },

  /* Actions */
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    gap: 4,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#007AFF",
  },

  /* Info */
  infoRow: {
    flexDirection: "row",
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
  },

  address: {
    fontSize: 14,
    color: "#666",
  },

  /* Favorite */
  favorite: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  favoriteText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
