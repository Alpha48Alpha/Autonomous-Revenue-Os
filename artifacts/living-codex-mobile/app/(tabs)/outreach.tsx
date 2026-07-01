import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useGetMessageStats, useListMessages } from "@workspace/api-client-react";

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: color ?? colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function messageStatusColor(status: string) {
  switch (status) {
    case "replied": return "#22c55e";
    case "sent": return "#3b82f6";
    case "bounced": return "#f04343";
    default: return "#a6a6a6";
  }
}

function channelIcon(channel: string, color: string) {
  if (channel === "sms") return <Ionicons name="chatbubble" size={14} color={color} />;
  return <Ionicons name="mail" size={14} color={color} />;
}

export default function OutreachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: stats } = useGetMessageStats();
  const { data: messages, isLoading, refetch, isRefetching } = useListMessages();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>OUTREACH HUB</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>AGENT-DRIVEN COMMS</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard label="SENT" value={stats?.totalSent ?? 0} />
        <StatCard label="REPLIED" value={stats?.totalReplied ?? 0} color="#22c55e" />
        <StatCard
          label="REPLY RATE"
          value={stats?.replyRate != null ? `${Math.round(stats.replyRate)}%` : "—"}
          color="#eab308"
        />
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              MESSAGES
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="email-search" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No outreach messages yet
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const statusColor = messageStatusColor(item.status ?? "draft");
            return (
              <View style={[styles.msgCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.msgTop}>
                  <View style={styles.msgMeta}>
                    {channelIcon(item.channel ?? "email", colors.mutedForeground)}
                    <Text style={[styles.msgChannel, { color: colors.mutedForeground }]}>
                      {(item.channel ?? "email").toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusColor + "22", borderColor: statusColor }]}>
                    <Text style={[styles.statusPillText, { color: statusColor }]}>
                      {(item.status ?? "draft").toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.msgSubject, { color: colors.foreground }]} numberOfLines={1}>
                  {item.subject ?? "(no subject)"}
                </Text>
                <Text style={[styles.msgBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {item.body ?? ""}
                </Text>
                <Text style={[styles.msgTime, { color: colors.mutedForeground }]}>
                  {item.sentAt ? new Date(item.sentAt).toLocaleDateString() : "Draft"}
                </Text>
              </View>
            );
          }}
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
    fontFamily: "Outfit_400Regular",
    letterSpacing: 1,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 2,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Outfit_700Bold",
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 1.5,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  msgCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 14,
    borderRadius: 2,
    borderWidth: 1,
    gap: 6,
  },
  msgTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  msgMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  msgChannel: {
    fontSize: 10,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.5,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 9,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.5,
  },
  msgSubject: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Outfit_600SemiBold",
  },
  msgBody: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    lineHeight: 18,
  },
  msgTime: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    marginTop: 2,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Outfit_400Regular" },
});
