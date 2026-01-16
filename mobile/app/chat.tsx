import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { clamp, runOnJS } from "react-native-reanimated";

export default function Index() {
  const [message, setMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [messages, setMessages] = useState<{ text: string; fromMe: boolean }[]>(
    [
      { text: "Hello!", fromMe: false },
      { text: "Hi!", fromMe: true },
    ]
  );

  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const pinchStartZoom = useRef(1);

  function send() {
    const trimmed = message.trim();
    if (trimmed === "") return;

    setMessages((prev) => [...prev, { text: trimmed, fromMe: true }]);
    setMessage("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { text: "I'm horny", fromMe: false }]);
    }, 600);
  }

  function startPinch() {
    pinchStartZoom.current = zoomRef.current;
  }

  function updatePinch(scale: number) {
    const next = clamp(pinchStartZoom.current * scale, 1, 1.8);
    zoomRef.current = next;
    setZoom(next);
  }

  function goBack() {
    router.back();
  }

  const pinch = Gesture.Pinch()
    .onBegin(() => runOnJS(startPinch)())
    .onUpdate((e) => runOnJS(updatePinch)(e.scale));

  // Updated: less likely to steal taps
  const swipeBack = Gesture.Pan()
    .activeOffsetX([20, 9999])
    .failOffsetY([-10, 10])
    .onEnd((e) => {
      if (e.translationX > 160) {
        runOnJS(goBack)();
      }
    });

  const gestures = Gesture.Simultaneous(pinch, swipeBack);

  const titleSize = 20 * zoom;
  const msgFont = 16 * zoom;
  const bubblePad = 10 * zoom;
  const bubbleRadius = 12 * zoom;
  const gap = 8 * zoom;

  const inputFont = 16 * zoom;

  const sendSize = 44 * zoom;
  const arrowSize = 22 * zoom;
  const inputRowSpace = sendSize + 20;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <GestureDetector gesture={gestures}>
        <View style={{ flex: 1, backgroundColor: "white", marginTop: 90, marginBottom: 10 }}>

          <View style={{ flex: 1, padding: 20 }}>
            <ScrollView
              style={{ flex: 1, marginTop: 10 }}
              contentContainerStyle={{ paddingBottom: inputRowSpace }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((m, i) => (
                <View
                  key={i}
                  style={{
                    alignSelf: m.fromMe ? "flex-end" : "flex-start",
                    backgroundColor: m.fromMe ? "#2fc29d" : "#e5e7eb",
                    padding: bubblePad,
                    borderRadius: bubbleRadius,
                    marginBottom: gap,
                    maxWidth: "85%",
                  }}
                >
                  <Text
                    style={{
                      color: m.fromMe ? "white" : "black",
                      fontSize: msgFont,
                    }}
                  >
                    {m.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message"
                placeholderTextColor="#6b7280"
                multiline
                blurOnSubmit={false}
                onContentSizeChange={(e) =>
                  setInputHeight(Math.min(e.nativeEvent.contentSize.height, 220))
                }
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 20,
                  marginRight: 10,
                  color: "black",
                  backgroundColor: "white",
                  fontSize: inputFont,
                  height: Math.max(40, inputHeight),
                }}
              />

              <Pressable
                onPress={send}
                hitSlop={12}
                style={{
                  width: sendSize,
                  height: sendSize,
                  borderRadius: sendSize / 2,
                  backgroundColor: "#2fc29d",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: arrowSize }}>→</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </GestureDetector>
    </KeyboardAvoidingView>
  );
}
