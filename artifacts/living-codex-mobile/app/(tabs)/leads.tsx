import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useGenerateLeads, useListLeads } from "@workspace/api-client-react";

const STATUSES = ["all", "new", "qualified", "contacted", "converted"] as const;
type Status = (typeof STATUSES)[number];

function ScoreBadge({ score }: { score: number | null | undefined }) {
  const colors = useColors();
  const s = score ?? 0;
  const bg = s >= 70 ? "#22c55e" : s >= 45 ? "#eab308" : colors.muted;
  return (
    <View style={[styles.scoreBadge, { backgroundColor: bg }]}>
      <Text style={[styles.scoreText, { color: s >= 45 ? "#000" : colors.mutedForeground }]}>
        {s}
      </Text>
    </View>
  );
}

function StatusChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.muted,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? colors.primaryForeground : colors.mutedForeground },
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

export default function LeadsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status>("all");

  const { data: leads, isLoading, refetch, isRefetching } = useListLeads({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
  });

  const generateMutation = useGenerateLeads();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function handleGenerate() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    generateMutation.mutate(
      { data: { count: 5 } },
      { onSuccess: () => { refetch(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>LEADS</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {leads?.length ?? 0} PROSPECTS
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search leads..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.chipRow}>
        {STATUSES.map((s) => (
          <StatusChip
            key={s}
            label={s}
            active={statusFilter === s}
            onPress={() => setStatusFilter(s)}
          />
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-search" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No leads found
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardLeft}>
                <Text style={[styles.leadName, { color: colors.foreground }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.leadTitle, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {item.title ?? "—"} · {item.company ?? "—"}
                </Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor(item.status ?? "") }]} />
                  <Text style={[styles.statusLabel, { color: colors.mutedForeground }]}>
                    {(item.status ?? "new").toUpperCase()}
                  </Text>
                </View>
              </View>
              <ScoreBadge score={item.score} />
            </View>
          )}
        />
      )}

      {/* FAB */}
      <View style={[styles.fab, { bottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handleGenerate}
          disabled={generateMutation.isPending}
          style={({ pressed }) => [
            styles.fabBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          {generateMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="flash" size={22} color="#fff" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

function statusColor(s: string) {
  switch (s) {
    case "qualified": return "#22c55e";
    case "converted": return "#3b82f6";
    case "contacted": return "#eab308";
    case "disqualified": return "#f04343";
    default: return "#a6a6a6";
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Outfit_700Bold",
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 1,
    marginTop: 2,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  chipRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 10,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 14,
    borderRadius: 2,
    borderWidth: 1,
    gap: 12,
  },
  cardLeft: { flex: 1 },
  leadName: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Outfit_600SemiBold",
  },
  leadTitle: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: {
    fontSize: 10,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.5,
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Outfit_700Bold",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Outfit_400Regular" },
  fab: { position: "absolute", right: 20 },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff6600",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
