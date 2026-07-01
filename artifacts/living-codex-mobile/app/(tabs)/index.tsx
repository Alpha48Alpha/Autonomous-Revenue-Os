import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import {
  useGetDashboardMetrics,
  useGetDashboardRecentActivity,
  useGetProofOfWork,
} from "@workspace/api-client-react";

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.metricValue, { color: accent ?? colors.primary }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function AgentStat({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.agentCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: color }]}>
      <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      <View style={styles.agentInfo}>
        <Text style={[styles.agentValue, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.agentLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useGetDashboardMetrics();
  const { data: pow, refetch: refetchPow } = useGetProofOfWork();
  const { data: activity, isLoading: actLoading, refetch: refetchAct } = useGetDashboardRecentActivity();

  const isLoading = metricsLoading;

  function refetch() {
    refetchMetrics();
    refetchPow();
    refetchAct();
  }

  function formatCurrency(n: number | null | undefined) {
    if (n == null) return "$0";
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.brandName, { color: colors.primary }]}>AUTONOMOUS REVENUE OS™</Text>
        </View>
        <View style={[styles.livePill, { backgroundColor: "#22c55e" }]}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          {/* Revenue Metrics */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>REVENUE METRICS</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="PIPELINE"
                value={formatCurrency(metrics?.pipeline?.totalValue)}
              />
              <MetricCard
                label="LEADS"
                value={String(metrics?.leads?.total ?? 0)}
                accent={colors.foreground}
              />
              <MetricCard
                label="REPLY RATE"
                value={metrics?.outreach?.replyRate != null
                  ? `${Math.round(metrics.outreach.replyRate)}%`
                  : "—"}
                accent="#eab308"
              />
              <MetricCard
                label="DEALS WON"
                value={String(metrics?.revenue?.closedWon ?? 0)}
                accent="#22c55e"
              />
            </View>
          </View>

          {/* Proof of Work */}
          {pow && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AGENT PROOF OF WORK</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
                <AgentStat icon="magnify" label="LEADS FOUND" value={pow.discovery?.leadsDiscovered ?? 0} color="#6366f1" />
                <AgentStat icon="send" label="MSGS SENT" value={pow.outreach?.messagesSent ?? 0} color="#ff6600" />
                <AgentStat icon="reply" label="REPLIES" value={pow.outreach?.repliesReceived ?? 0} color="#22c55e" />
                <AgentStat icon="handshake" label="DEALS WON" value={pow.revenue?.dealsWon ?? 0} color="#eab308" />
                <AgentStat icon="robot" label="AGENTS" value={pow.overall?.activeAgents ?? 0} color="#14b8a6" />
              </ScrollView>
            </View>
          )}

          {/* Live Activity Feed */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LIVE AGENT FEED</Text>
            {activity && activity.length > 0 ? (
              activity.slice(0, 20).map((item, idx) => (
                <View key={item.id ?? idx} style={[styles.activityRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.activityDot, { backgroundColor: teamColor(item.agentTeam ?? "") }]} />
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityDesc, { color: colors.foreground }]} numberOfLines={2}>
                      {item.description ?? "Agent action"}
                    </Text>
                    <Text style={[styles.activityMeta, { color: colors.mutedForeground }]}>
                      {(item.agentTeam ?? "").replace(/_/g, " ").toUpperCase()}
                      {item.createdAt
                        ? " · " + new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.empty}>
                <Ionicons name="pulse" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Agents are initializing...
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function teamColor(team: string) {
  const map: Record<string, string> = {
    research: "#6366f1",
    opportunity: "#3b82f6",
    outreach: "#ff6600",
    sales: "#22c55e",
    crm: "#eab308",
    strategy: "#a855f7",
    revenue_ops: "#14b8a6",
  };
  return map[team] ?? "#a6a6a6";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Outfit_700Bold",
    letterSpacing: 3,
  },
  brandSub: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  livePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  liveText: {
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    color: "#000",
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricCard: {
    width: "47.5%",
    padding: 14,
    borderRadius: 2,
    borderWidth: 1,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Outfit_700Bold",
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 1,
    marginTop: 4,
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 2,
    padding: 12,
    gap: 10,
    minWidth: 120,
  },
  agentInfo: { gap: 1 },
  agentValue: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
  },
  agentLabel: {
    fontSize: 9,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.5,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    flexShrink: 0,
  },
  activityContent: { flex: 1 },
  activityDesc: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    lineHeight: 18,
  },
  activityMeta: {
    fontSize: 10,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.5,
    marginTop: 3,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Outfit_400Regular" },
});
