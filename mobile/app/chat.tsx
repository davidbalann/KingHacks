import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";

import { Composer } from "@/components/chat/Composer";
import { MessageBubble } from "@/components/chat/RenderBubble";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Chat = () => {
    const { chatId } = useLocalSearchParams<{
        chatId: string;
    }>();

    const chat = {
        isLoadingMessages: true,
        messages: []
    };

    const [isSending, setIsSending] = useState(false);
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const router = useRouter()

    const sendMessage = async (text: string) => {
        console.log('hello')
    };

    return (
    <>  
        <KeyboardStickyView
            style={[styles.container, { paddingTop: 20, backgroundColor: colors.background }]}
            offset={{ closed: -insets.bottom, opened: 0 }}
        >
            {chat.isLoadingMessages && chat.messages.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.text, marginTop: 10 }}>Loading messages...</Text>
                </View>
            ) : (
                <FlatList
                    inverted
                    contentContainerStyle={{paddingHorizontal: 12}}
                    data={chat.messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <MessageBubble item={item} index={index} messages={chat.messages} members={chat.members} chat_id={chatId} />
                    )}
                    extraData={chat.members}
                    onEndReached={loadOlderMessages}
                />
            )}
            <Composer 
                onSend={sendMessage} 
                isSending={isSending}
                onActionPress={() => console.log('wow')}
            />
        </KeyboardStickyView>
    </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        borderColor: "#ccc",
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        flex: 1,
        maxHeight: 100,
    },
    inputContainer: {
        alignItems: "flex-end",
        borderColor: "#ccc",
        borderTopWidth: 1,
        flexDirection: "row",
        padding: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadMoreContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    loadMoreButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    loadMoreText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default Chat;