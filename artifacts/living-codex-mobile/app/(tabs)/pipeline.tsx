import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useGetDealsPipeline, useListDeals } from "@workspace/api-client-react";

const STAGES = [
  { key: "discovery", label: "DISCOVERY", color: "#6366f1" },
  { key: "qualified", label: "QUALIFIED", color: "#3b82f6" },
  { key: "proposal", label: "PROPOSAL", color: "#eab308" },
  { key: "negotiation", label: "NEGOTIATION", color: "#f97316" },
  { key: "closed_won", label: "WON", color: "#22c55e" },
  { key: "closed_lost", label: "LOST", color: "#f04343" },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

function formatCurrency(n: number | null | undefined) {
  if (n == null) return "$0";
  return "$" + (n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n.toString());
}

export default function PipelineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [selectedStage, setSelectedStage] = useState<StageKey>("discovery");

  const { data: pipeline } = useGetDealsPipeline();
  const { data: deals, isLoading, refetch, isRefetching } = useListDeals({ stage: selectedStage });

  const stageInfo = STAGES.find((s) => s.key === selectedStage);
  const totalValue = pipeline?.totalValue;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>PIPELINE</Text>
        <Text style={[styles.headerSub, { color: colors.primary }]}>
          {totalValue != null ? formatCurrency(totalValue) + " TOTAL" : "DEAL TRACKER"}
        </Text>
      </View>

      {/* Stage selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stageScroll}
      >
        {STAGES.map((stage) => {
          const stageData = pipeline?.stages?.find((s: any) => s.stage === stage.key);
          const active = selectedStage === stage.key;
          return (
            <Pressable
              key={stage.key}
              onPress={() => setSelectedStage(stage.key)}
              style={[
                styles.stageTab,
                {
                  backgroundColor: active ? stage.color + "22" : colors.muted,
                  borderColor: active ? stage.color : colors.border,
                },
              ]}
            >
              <Text style={[styles.stageLabel, { color: active ? stage.color : colors.mutedForeground }]}>
                {stage.label}
              </Text>
              {stageData && (
                <Text style={[styles.stageValue, { color: active ? stage.color : colors.mutedForeground }]}>
                  {formatCurrency(stageData.value)}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Pipeline summary row */}
      <View style={styles.summaryRow}>
        {STAGES.map((stage) => {
          const stageData = pipeline?.stages?.find((s: any) => s.stage === stage.key);
          const count = stageData?.count ?? 0;
          return (
            <View key={stage.key} style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: stage.color }]} />
              <Text style={[styles.summaryCount, { color: stage.color }]}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Deals list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={deals}
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
              <MaterialCommunityIcons name="chart-timeline-variant" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No deals in {stageInfo?.label ?? selectedStage}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.dealCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.dealAccent, { backgroundColor: stageInfo?.color ?? colors.primary }]} />
              <View style={styles.dealContent}>
                <View style={styles.dealTop}>
                  <Text style={[styles.dealName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.title ?? "Untitled Deal"}
                  </Text>
                  <Text style={[styles.dealValue, { color: stageInfo?.color ?? colors.primary }]}>
                    {formatCurrency(item.value)}
                  </Text>
                </View>
                {item.expectedCloseDate && (
                  <Text style={[styles.dealDate, { color: colors.mutedForeground }]}>
                    Close: {new Date(item.expectedCloseDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
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
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  stageScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  stageTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 80,
  },
  stageLabel: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 0.5,
  },
  stageValue: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  summaryDot: { width: 6, height: 6, borderRadius: 3 },
  summaryCount: { fontSize: 12, fontFamily: "Outfit_700Bold" },
  dealCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    overflow: "hidden",
  },
  dealAccent: { width: 3 },
  dealContent: { flex: 1, padding: 14, gap: 4 },
  dealTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dealName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
    marginRight: 8,
  },
  dealValue: {
    fontSize: 15,
    fontFamily: "Outfit_700Bold",
  },
  dealCompany: { fontSize: 12, fontFamily: "Outfit_400Regular" },
  dealDate: { fontSize: 11, fontFamily: "Outfit_400Regular", marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Outfit_400Regular" },
});
