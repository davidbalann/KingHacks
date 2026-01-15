import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ComposerProps {
  onSend: (text: string) => Promise<void>;
  isSending?: boolean;
  onActionPress?: () => void; // optional
  hideOnSend?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  onSend,
  isSending = false,
  onActionPress,
  hideOnSend = false
}) => {
  const [inputText, setInputText] = useState("");
  const { colors, dark } = useTheme();

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setInputText("");
    if (hideOnSend) {
      Keyboard.dismiss();
    }
    await onSend(text);

  };

  const inputBackground = dark ? "#25292E" : "#f0f0f0";

  return (
    <View style={styles.inputContainer}>
      {/* Action button (only show if onActionPress exists) */}
      {onActionPress && (
        <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
          <Ionicons name="add-circle" size={40} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Text input */}
      <TextInput
        onChangeText={setInputText}
        placeholder="Message..."
        placeholderTextColor={colors.text + "80"}
        style={[styles.input, { color: colors.text, backgroundColor: inputBackground }]}
        value={inputText}
        multiline
        maxLength={500}
      />

      {/* Send button */}
      <Pressable
        onPress={handleSend}
        style={{ opacity: !inputText.trim() || isSending ? 0.5 : 1 }}
        disabled={!inputText.trim() || isSending}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons name="arrow-up-circle" size={40} color={colors.primary} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 20,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flex: 1,
    maxHeight: 100,
    fontSize: 17,
  },
  inputContainer: {
    backgroundColor: "transparent",
    alignItems: "flex-end",
    justifyContent: "center",
    flexDirection: "row",
    padding: 10,
  },
  actionButton: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});