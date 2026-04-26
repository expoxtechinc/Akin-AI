import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSendChatMessage } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
}

const SUGGESTIONS = [
  { icon: "book-open", label: "Help me study for an exam" },
  { icon: "edit-3", label: "Edit my scholarship essay" },
  { icon: "compass", label: "Plan my career next step" },
  { icon: "globe", label: "Find scholarships for my field" },
] as const;

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList<Message>>(null);
  const sendChat = useSendChatMessage();

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sendChat.isPending) return;
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      const userMsg: Message = { id: genId(), role: "user", content: trimmed };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");

      try {
        const res = await sendChat.mutateAsync({
          data: {
            messages: next.map((m) => ({ role: m.role, content: m.content })),
          },
        });
        const reply = res?.reply ?? "Sorry, I couldn't generate a reply.";
        setMessages((prev) => [
          ...prev,
          { id: genId(), role: "assistant", content: reply },
        ]);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setMessages((prev) => [
          ...prev,
          {
            id: genId(),
            role: "assistant",
            content:
              "I hit an error reaching Gemini. " +
              msg +
              "\n\nMake sure GEMINI_API_KEY is set in your environment.",
          },
        ]);
      }
    },
    [messages, sendChat],
  );

  const dataInverted = useMemo(() => [...messages].reverse(), [messages]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <View
        style={[
          styles.bubbleRow,
          { justifyContent: item.role === "user" ? "flex-end" : "flex-start" },
        ]}
      >
        {item.role === "assistant" && (
          <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.aiAvatarText}>A</Text>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            item.role === "user"
              ? { backgroundColor: colors.primary }
              : {
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
          ]}
        >
          <Text
            style={{
              color:
                item.role === "user"
                  ? colors.primaryForeground
                  : colors.foreground,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              lineHeight: 22,
            }}
            selectable
          >
            {item.content}
          </Text>
        </View>
      </View>
    ),
    [colors],
  );

  const Empty = (
    <View style={styles.emptyWrap}>
      <View
        style={[
          styles.heroAvatar,
          { backgroundColor: colors.primary, shadowColor: colors.primary },
        ]}
      >
        <Text style={styles.heroAvatarText}>A</Text>
      </View>
      <Text
        style={[
          styles.heroTitle,
          { color: colors.foreground, fontFamily: "Inter_700Bold" },
        ]}
      >
        AkinAI
      </Text>
      <Text
        style={[
          styles.heroSub,
          { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
        ]}
      >
        Your assistant for ideas, learning, and growth.{"\n"}Powered by Google
        Gemini.
      </Text>

      <View style={styles.suggestionGrid}>
        {SUGGESTIONS.map((s) => (
          <Pressable
            key={s.label}
            onPress={() => send(s.label)}
            style={({ pressed }) => [
              styles.suggestionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Feather
              name={s.icon as keyof typeof Feather.glyphMap}
              size={18}
              color={colors.primary}
            />
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                marginTop: 8,
                lineHeight: 18,
              }}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const Header = (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + (isWeb ? 67 : 12),
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.headerInner}>
        <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerAvatarText}>A</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 17,
            }}
          >
            AkinAI
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 12,
            }}
          >
            {sendChat.isPending ? "Thinking..." : "Online · Gemini"}
          </Text>
        </View>
        {messages.length > 0 && (
          <Pressable
            onPress={() => setMessages([])}
            hitSlop={10}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Feather name="edit" size={20} color={colors.foreground} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {Header}
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          Empty
        ) : (
          <FlatList
            ref={listRef}
            data={dataInverted}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            inverted
            contentContainerStyle={{
              paddingHorizontal: 14,
              paddingTop: 12,
              paddingBottom: 18,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListHeaderComponent={
              sendChat.isPending ? (
                <View style={[styles.bubbleRow, { justifyContent: "flex-start" }]}>
                  <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.aiAvatarText}>A</Text>
                  </View>
                  <View
                    style={[
                      styles.bubble,
                      { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
                    ]}
                  >
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <View
          style={[
            styles.composerWrap,
            {
              paddingBottom: Math.max(insets.bottom, 12) + (isWeb ? 84 : 60),
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.composer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message AkinAI"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={{
                flex: 1,
                color: colors.foreground,
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                maxHeight: 120,
                minHeight: 22,
                paddingTop: 4,
              }}
              onSubmitEditing={() => send(input)}
              blurOnSubmit={false}
            />
            <Pressable
              disabled={!input.trim() || sendChat.isPending}
              onPress={() => send(input)}
              style={({ pressed }) => [
                styles.sendBtn,
                {
                  backgroundColor:
                    input.trim() && !sendChat.isPending
                      ? colors.primary
                      : colors.muted,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather
                name="arrow-up"
                size={18}
                color={
                  input.trim() && !sendChat.isPending
                    ? colors.primaryForeground
                    : colors.mutedForeground
                }
              />
            </Pressable>
          </View>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 11,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Powered by Google AI Studio · Akin S. Sokpah
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroAvatarText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 32,
  },
  heroTitle: { fontSize: 28, marginTop: 18 },
  heroSub: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  suggestionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 28,
    width: "100%",
  },
  suggestionCard: {
    flexBasis: "48%",
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    minHeight: 84,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginVertical: 4,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: "82%",
  },
  composerWrap: {
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
