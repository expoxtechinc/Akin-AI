import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetInspiration } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

export default function InspireScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const { data, isLoading, isRefetching, refetch } = useGetInspiration();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + (isWeb ? 67 : 20),
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + (isWeb ? 110 : 100),
          gap: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        <View>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 30,
            }}
          >
            Inspire
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            A daily nudge for thinkers, builders, and dreamers
          </Text>
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 80 }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <>
            <View
              style={[
                styles.quoteCard,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
              ]}
            >
              <Feather
                name="message-square"
                size={20}
                color={colors.primaryForeground}
                style={{ opacity: 0.8 }}
              />
              <Text
                style={{
                  color: colors.primaryForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 22,
                  lineHeight: 30,
                  marginTop: 12,
                }}
              >
                “{data?.quote.quote}”
              </Text>
              <Text
                style={{
                  color: colors.primaryForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  marginTop: 14,
                  opacity: 0.85,
                }}
              >
                — {data?.quote.author}
              </Text>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.cardHead}>
                <View
                  style={[
                    styles.iconBubble,
                    { backgroundColor: colors.accent + "33" },
                  ]}
                >
                  <Feather name="book" size={16} color={colors.foreground} />
                </View>
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  Study tip of the day
                </Text>
              </View>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  marginTop: 10,
                }}
              >
                {data?.tip.title}
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  lineHeight: 21,
                  marginTop: 6,
                }}
              >
                {data?.tip.body}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  marginBottom: 10,
                }}
              >
                Try one with AkinAI
              </Text>
              <View style={{ gap: 10 }}>
                {data?.prompts.map((p) => (
                  <Pressable
                    key={p.title}
                    onPress={() => router.push("/")}
                    style={({ pressed }) => [
                      styles.promptCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.foreground,
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 15,
                        }}
                      >
                        {p.title}
                      </Text>
                      <Text
                        style={{
                          color: colors.mutedForeground,
                          fontFamily: "Inter_400Regular",
                          fontSize: 13,
                          lineHeight: 19,
                          marginTop: 4,
                        }}
                        numberOfLines={2}
                      >
                        {p.prompt}
                      </Text>
                    </View>
                    <Feather
                      name="arrow-up-right"
                      size={18}
                      color={colors.primary}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  quoteCard: {
    borderRadius: 22,
    padding: 22,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  promptCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
});
