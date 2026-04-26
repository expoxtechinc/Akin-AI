import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useListScholarships } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

interface Scholarship {
  id: string;
  title: string;
  organization: string;
  location: string;
  level: string;
  deadline: string;
  amount?: string;
  url: string;
  tags: string[];
}

export default function ScholarshipsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { data, isLoading, isRefetching, refetch } = useListScholarships();

  const items = (data?.items ?? []) as Scholarship[];
  const tags = useMemo(() => {
    const t = new Set<string>();
    items.forEach((s) => s.tags?.forEach((x) => t.add(x)));
    return Array.from(t).slice(0, 12);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.organization.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q);
      const matchesTag = !activeTag || s.tags?.includes(activeTag);
      return matchesQ && matchesTag;
    });
  }, [items, query, activeTag]);

  const open = async (url: string) => {
    if (Platform.OS === "web") {
      Linking.openURL(url);
    } else {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: colors.primary,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (isWeb ? 67 : 16),
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Inter_700Bold",
            fontSize: 30,
          }}
        >
          Scholarships
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            marginTop: 4,
          }}
        >
          Curated from ScholarshipTab and global programs
        </Text>

        <View
          style={[
            styles.search,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by program, country, level"
            placeholderTextColor={colors.mutedForeground}
            style={{
              flex: 1,
              color: colors.foreground,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
            }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <FlatList
          data={[null, ...tags]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(t, i) => `${t}-${i}`}
          contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
          renderItem={({ item }) => {
            const label = item ?? "All";
            const active = item === activeTag || (item === null && activeTag === null);
            return (
              <Pressable
                onPress={() => setActiveTag(item)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    opacity: pressed ? 0.6 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.primaryForeground : colors.foreground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + (isWeb ? 110 : 100),
            gap: 12,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="search" size={28} color={colors.mutedForeground} />
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  marginTop: 8,
                }}
              >
                No scholarships match your search.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => open(item.url)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.cardBadge,
                    { backgroundColor: colors.accent + "33" },
                  ]}
                >
                  <Feather name="award" size={14} color={colors.foreground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      lineHeight: 21,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontFamily: "Inter_400Regular",
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    {item.organization}
                  </Text>
                </View>
                <Feather
                  name="external-link"
                  size={16}
                  color={colors.mutedForeground}
                />
              </View>

              <View style={styles.metaRow}>
                <Meta
                  icon="map-pin"
                  text={item.location}
                  color={colors.mutedForeground}
                />
                <Meta
                  icon="layers"
                  text={item.level}
                  color={colors.mutedForeground}
                />
              </View>
              <View style={styles.metaRow}>
                <Meta
                  icon="calendar"
                  text={`Deadline: ${item.deadline}`}
                  color={colors.mutedForeground}
                />
                {item.amount ? (
                  <Meta
                    icon="dollar-sign"
                    text={item.amount}
                    color={colors.mutedForeground}
                  />
                ) : null}
              </View>

              <View style={styles.tagsRow}>
                {item.tags.slice(0, 4).map((t) => (
                  <View
                    key={t}
                    style={[styles.tag, { backgroundColor: colors.muted }]}
                  >
                    <Text
                      style={{
                        color: colors.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 11,
                      }}
                    >
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          )}
          ListFooterComponent={
            filtered.length > 0 ? (
              <Pressable
                onPress={() => open("https://www.scholarshiptab.com/")}
                style={({ pressed }) => ({
                  marginTop: 16,
                  alignItems: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                  }}
                >
                  Explore more on ScholarshipTab
                </Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </View>
  );
}

function Meta({
  icon,
  text,
  color,
}: {
  icon: keyof typeof Feather.glyphMap;
  text: string;
  color: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flexShrink: 1,
      }}
    >
      <Feather name={icon} size={13} color={color} />
      <Text
        style={{
          color,
          fontFamily: "Inter_400Regular",
          fontSize: 12.5,
          flexShrink: 1,
        }}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 4 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 4 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
});
