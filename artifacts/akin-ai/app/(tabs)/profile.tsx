import React from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const open = async (url: string) => {
    if (Platform.OS === "web") {
      Linking.openURL(url);
    } else {
      await WebBrowser.openBrowserAsync(url, {
        controlsColor: colors.primary,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + (isWeb ? 67 : 20),
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + (isWeb ? 110 : 100),
          gap: 16,
        }}
      >
        <View style={styles.heroWrap}>
          <View
            style={[
              styles.avatarRing,
              { borderColor: colors.primary, shadowColor: colors.primary },
            ]}
          >
            <Image
              source={require("@/assets/images/creator.png")}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 24,
              marginTop: 16,
            }}
          >
            Akin S. Sokpah
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              marginTop: 2,
            }}
          >
            Creator of AkinAI · Liberia
          </Text>

          <View
            style={[
              styles.locationPill,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Text style={styles.flag}>🇱🇷</Text>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
              }}
            >
              Made in Liberia
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            About AkinAI
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 14.5,
              lineHeight: 22,
            }}
          >
            AkinAI is a personal assistant built to help students, creators, and
            founders learn faster, write better, and chase opportunity. It is
            powered by Google Gemini through Google AI Studio and was created by
            Akin S. Sokpah from Liberia.
          </Text>
        </View>

        <Row
          icon="zap"
          title="Powered by Google AI Studio"
          subtitle="aistudio.google.com"
          onPress={() => open("https://aistudio.google.com/")}
          colors={colors}
        />
        <Row
          icon="award"
          title="Scholarships hub"
          subtitle="scholarshiptab.com"
          onPress={() => open("https://www.scholarshiptab.com/")}
          colors={colors}
        />
        <Row
          icon="github"
          title="Source on GitHub"
          subtitle="expoxtechinc/Akin-AI"
          onPress={() => open("https://github.com/expoxtechinc/Akin-AI")}
          colors={colors}
        />
        <Row
          icon="key"
          title="Get a free Gemini API key"
          subtitle="aistudio.google.com/app/api-keys"
          onPress={() =>
            open("https://aistudio.google.com/app/api-keys")
          }
          colors={colors}
        />

        <Text
          style={{
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            textAlign: "center",
            marginTop: 24,
            lineHeight: 18,
          }}
        >
          AkinAI v1.0 · Built with care from West Africa to the world.{"\n"}
          Talent is universal. Opportunity is not. Build the bridge.
        </Text>
      </ScrollView>
    </View>
  );
}

interface RowColors {
  card: string;
  border: string;
  foreground: string;
  mutedForeground: string;
  primary: string;
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: RowColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: colors.primary + "1A" },
        ]}
      >
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  avatarRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 3,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  avatar: { width: 116, height: 116, borderRadius: 58 },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  flag: { fontSize: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
