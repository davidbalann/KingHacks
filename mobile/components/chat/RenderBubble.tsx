import { useTheme } from "@react-navigation/native";
import * as Haptics from 'expo-haptics';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  item: Message;
  index: number;
  messages: Message[];
  showSeen?: boolean;
  chat_id: string;
}

export const MessageBubble: React.FC<Props> = ({
  item,
  index,
  messages
}) => {
  const { dark } = useTheme(); // 👈 pull theme colors
  const router = useRouter();

  const nextItem = index > 0 ? messages[index - 1] : null;
  const prevItem = index < messages.length - 1 ? messages[index + 1] : null;

  const sameAsPrev = prevItem && prevItem.profiles?.id === item.profiles?.id;
  const sameAsNext = nextItem && nextItem.profiles?.id === item.profiles?.id;
  const addSpacing = prevItem && prevItem.profiles?.id !== item.profiles?.id;

  const isFromOther = item.profiles?.id !== profile?.id;

  const R = 16;
  const S = 4;

  const bubbleStyle = {
    borderTopLeftRadius: isFromOther ? (sameAsPrev ? S : R) : R,
    borderBottomLeftRadius: isFromOther ? (sameAsNext ? S : R) : R,
    borderTopRightRadius: !isFromOther ? (sameAsPrev ? S : R) : R,
    borderBottomRightRadius: !isFromOther ? (sameAsNext ? S : R) : R,
  };

  const otherMessageBackground = dark ? "#25292E" : "#f1f1f1"; // dark opposite
  const otherMessageTextColor = dark ? "#fff" : "#000";

  return (
    <View
      style={[
        {
          flexDirection: "row",
          marginVertical: 1,
          alignItems: "flex-end",
        },
        addSpacing && { marginTop: 8 },
      ]}
    >
      {isFromOther ? (
        <View style={styles.avatarWrapper}>
          {!sameAsNext && (
            <Pressable onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}>
              <Image
                source={{ uri: item.profiles?.pfp ?? undefined }}
                style={styles.avatar}
              />
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.avatarWrapper} />
      )}

      <View style={[isFromOther ? styles.otherStyle : styles.userStyle]}>
        {isFromOther && !sameAsPrev && (
          <Text style={styles.senderName}>{item.profiles?.name}</Text>
        )}

        <View
          style={[
            { padding: item.image_url ? 0 : 10, borderRadius: 15 },
            bubbleStyle,
            isFromOther
              ? [styles.otherMessageContainer, { backgroundColor: otherMessageBackground }]
              : styles.userMessageContainer,
          ]}
        >
          {item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={[styles.messageImage, {aspectRatio: item.image_aspect_ratio || 1}]}
              contentFit="cover"
            />
          )}

          {item.content && <Text
            style={[
              styles.messageText,
              isFromOther
                ? { color: otherMessageTextColor }
                : styles.userMessageText,
            ]}
          >
            {item.content}
          </Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarWrapper: {
    width: 36,
    alignItems: "center",
    marginRight: 10,
    justifyContent: "flex-end",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 2,
  },
  otherMessageContainer: {
    backgroundColor: "#f1f1f1", // default light
  },
  otherStyle: {
    alignSelf: "flex-start",
    maxWidth: "50%",
  },
  messageText: {
    fontSize: 17,
  },
  messageImage: {
    width: 200,
    borderRadius: 8,
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    fontWeight: "500",
  },
  userMessageContainer: {
    backgroundColor: "#4f46e5",
  },
  userMessageText: {
    color: "white",
  },
  userStyle: {
    alignItems: "flex-end",
    alignSelf: "flex-end",
    maxWidth: "70%",
    marginLeft: "auto",
  },
});