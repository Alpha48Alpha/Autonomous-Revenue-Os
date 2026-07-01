import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function buildCsv(detail: CampaignDetail): string {
  const header = ["Name", "Phone", "Status", "Error"];
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = detail.results.map((r) => {
    const status = r.success ? "sent" : r.skipped ? "skipped" : "failed";
    return [r.name, r.phone ?? "", status, r.error ?? ""].map(escape).join(",");
  });
  return [header.map(escape).join(","), ...rows].join("\r\n");
}

async function exportCampaign(detail: CampaignDetail) {
  const csv = buildCsv(detail);
  const date = new Date(detail.startedAt).toISOString().slice(0, 10);
  const fileName = `campaign-${detail.id}-${date}.csv`;

  if (Platform.OS === "web") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    Alert.alert("Sharing not available", "Sharing is not supported on this device.");
    return;
  }

  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(fileUri, {
    mimeType: "text/csv",
    dialogTitle: `Export ${fileName}`,
  });
}

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

interface CampaignHistoryItem {
  id: number;
  template: string;
  sent: number;
  failed: number;
  skipped: number;
  total: number;
  startedAt: string;
  finishedAt: string | null;
}

interface ContactResult {
  id: number;
  campaignId: number;
  leadId: number;
  name: string;
  phone: string | null;
  success: boolean;
  skipped: boolean;
  error: string | null;
}

interface CampaignDetail extends CampaignHistoryItem {
  results: ContactResult[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    "  " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
}

function useCampaignHistory() {
  const query = useQuery<CampaignHistoryItem[]>({
    queryKey: ["campaigns", "history"],
    queryFn: () => apiFetch<CampaignHistoryItem[]>("/api/campaigns/history"),
    staleTime: 5_000,
    refetchInterval: (q) => {
      const rows = (q.state.data as CampaignHistoryItem[] | undefined) ?? [];
      return rows.some((c) => c.finishedAt === null) ? 5_000 : 30_000;
    },
  });
  return query;
}

function RunningBanner({ sent, total }: { sent: number; total: number }) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(1)).current;
  const pct = total > 0 ? Math.min(sent / total, 1) : 0;
  const progressAnim = useRef(new Animated.Value(pct)).current;

  const rateHistory = useRef<{ sent: number; ts: number }[]>([]);

  useEffect(() => {
    const now = Date.now();
    const history = rateHistory.current;
    if (history.length === 0 || history[history.length - 1].sent !== sent) {
      history.push({ sent, ts: now });
      const cutoff = now - 10 * 60 * 1000;
      rateHistory.current = history.filter((p) => p.ts >= cutoff);
    }
  }, [sent]);

  const rate = (() => {
    const history = rateHistory.current;
    if (history.length < 2) return null;
    const oldest = history[0];
    const newest = history[history.length - 1];
    const deltaMs = newest.ts - oldest.ts;
    if (deltaMs < 1000) return null;
    const deltaSent = newest.sent - oldest.sent;
    if (deltaSent <= 0) return null;
    return Math.round((deltaSent / deltaMs) * 60_000);
  })();

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View
      style={[
        styles.runningBanner,
        { backgroundColor: "#f59e0b22", borderColor: "#f59e0b" },
      ]}
    >
      <View style={styles.runningRow}>
        <Animated.View
          style={[
            styles.runningDot,
            { backgroundColor: "#f59e0b", opacity: pulse },
          ]}
        />
        <Text style={[styles.runningText, { color: "#f59e0b" }]}>
          BLAST IN PROGRESS
        </Text>
        <Text style={[styles.runningCount, { color: "#f59e0b" }]}>
          {sent} / {total} sent{rate !== null ? `  ·  ~${rate}/min` : ""}
        </Text>
        <ActivityIndicator size="small" color="#f59e0b" style={{ marginLeft: 2 }} />
      </View>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: barWidth }]}
          />
        </View>
        <Text style={styles.progressPct}>
          {Math.round(pct * 100)}%
        </Text>
      </View>
    </View>
  );
}

function useCampaignDetail(id: number | null) {
  return useQuery<CampaignDetail>({
    queryKey: ["campaigns", "history", id],
    queryFn: () => apiFetch<CampaignDetail>(`/api/campaigns/history/${id}`),
    enabled: id !== null,
    staleTime: 60_000,
  });
}

function StatPill({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statPill,
        { backgroundColor: color + "22", borderColor: color },
      ]}
    >
      <Text style={[styles.statPillValue, { color }]}>{value}</Text>
      <Text style={[styles.statPillLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function ContactRow({ item }: { item: ContactResult }) {
  const colors = useColors();
  const statusColor = item.success
    ? "#22c55e"
    : item.skipped
      ? "#a6a6a6"
      : "#f04343";
  const statusLabel = item.success ? "SENT" : item.skipped ? "SKIPPED" : "FAILED";

  return (
    <View
      style={[
        styles.contactRow,
        { borderColor: colors.border, backgroundColor: colors.background },
      ]}
    >
      <View style={styles.contactLeft}>
        <Text style={[styles.contactName, { color: colors.foreground }]}>
          {item.name}
        </Text>
        <Text style={[styles.contactPhone, { color: colors.mutedForeground }]}>
          {item.phone ?? "no phone"}
        </Text>
        {item.error ? (
          <Text style={[styles.contactError, { color: "#f04343" }]}>
            {item.error}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.contactStatusPill,
          { backgroundColor: statusColor + "22", borderColor: statusColor },
        ]}
      >
        <Text style={[styles.contactStatusText, { color: statusColor }]}>
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

function CampaignRow({
  item,
  expanded,
  onToggle,
}: {
  item: CampaignHistoryItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();
  const [exporting, setExporting] = useState(false);
  const { data: detail, isLoading: detailLoading } = useCampaignDetail(
    expanded ? item.id : null
  );
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(item.template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExport() {
    if (!detail) return;
    setExporting(true);
    try {
      await exportCampaign(detail);
    } catch (e: any) {
      Alert.alert("Export failed", e?.message ?? "Unknown error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <View
      style={[
        styles.campaignCard,
        {
          backgroundColor: colors.card,
          borderColor: expanded ? colors.primary + "80" : colors.border,
        },
      ]}
    >
      <Pressable onPress={onToggle} style={styles.campaignHeader}>
        <View style={styles.campaignHeaderLeft}>
          <Text style={[styles.campaignDate, { color: colors.mutedForeground }]}>
            {formatDate(item.startedAt)}
          </Text>
          <Text
            style={[styles.campaignTemplate, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {item.template.slice(0, 100)}
            {item.template.length > 100 ? "…" : ""}
          </Text>
          <View style={styles.statRow}>
            <StatPill value={item.sent} label="SENT" color="#22c55e" />
            <StatPill value={item.failed} label="FAILED" color="#f04343" />
            <StatPill value={item.skipped} label="SKIPPED" color="#a6a6a6" />
            <StatPill value={item.total} label="TOTAL" color="#6366f1" />
          </View>
        </View>
        <View style={styles.chevronWrap}>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
          />
        </View>
      </Pressable>

      {expanded && (
        <View
          style={[styles.detailsContainer, { borderTopColor: colors.border }]}
        >
          <View style={styles.fullMessageLabelRow}>
            <Text
              style={[styles.detailsLabel, { color: colors.mutedForeground }]}
            >
              FULL MESSAGE
            </Text>
            <Pressable
              onPress={handleCopy}
              style={[
                styles.copyButton,
                {
                  backgroundColor: copied
                    ? "#22c55e22"
                    : colors.primary + "22",
                  borderColor: copied ? "#22c55e" : colors.primary,
                },
              ]}
            >
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={12}
                color={copied ? "#22c55e" : colors.primary}
              />
              <Text
                style={[
                  styles.copyButtonText,
                  { color: copied ? "#22c55e" : colors.primary },
                ]}
              >
                {copied ? "Copied!" : "Copy"}
              </Text>
            </Pressable>
          </View>
          <View
            style={[
              styles.fullMessageBox,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.fullMessageText, { color: colors.foreground }]}
            >
              {item.template}
            </Text>
          </View>

          <Pressable
            onPress={handleExport}
            disabled={exporting || detailLoading || !detail}
            style={[
              styles.exportBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                opacity: exporting || detailLoading || !detail ? 0.5 : 1,
              },
            ]}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="share-outline" size={14} color={colors.primary} />
            )}
            <Text style={[styles.exportBtnText, { color: colors.primary }]}>
              {exporting ? "Exporting…" : "Export CSV"}
            </Text>
          </Pressable>

          <Text
            style={[
              styles.detailsLabel,
              { color: colors.mutedForeground, marginTop: 12 },
            ]}
          >
            CONTACT BREAKDOWN
          </Text>
          {detailLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
          ) : !detail?.results?.length ? (
            <Text
              style={[styles.noResults, { color: colors.mutedForeground }]}
            >
              No contact results recorded.
            </Text>
          ) : (
            detail.results.map((r) => (
              <ContactRow key={r.id} item={r} />
            ))
          )}
        </View>
      )}
    </View>
  );
}

export default function CampaignsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const {
    data: history,
    isLoading,
    refetch,
    isRefetching,
  } = useCampaignHistory();

  const runningCampaign = (history ?? []).find((c) => c.finishedAt === null);
  const hasRunning = runningCampaign !== undefined;

  function toggleRow(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          CAMPAIGNS
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          SMS BLAST HISTORY
        </Text>
        {hasRunning && runningCampaign && (
          <RunningBanner sent={runningCampaign.sent} total={runningCampaign.total} />
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={history ?? []}
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
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.mutedForeground },
              ]}
            >
              PAST BLASTS
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="bullhorn-outline"
                size={40}
                color={colors.mutedForeground}
              />
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
                No campaign runs yet
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <CampaignRow
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => toggleRow(item.id)}
            />
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
    fontFamily: "Outfit_400Regular",
    letterSpacing: 1,
    marginTop: 2,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 1.5,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Outfit_400Regular" },
  campaignCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 2,
    borderWidth: 1,
    overflow: "hidden",
  },
  campaignHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 10,
  },
  campaignHeaderLeft: { flex: 1, gap: 8 },
  campaignDate: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 0.5,
  },
  campaignTemplate: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    lineHeight: 18,
  },
  statRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
  },
  statPillValue: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Outfit_700Bold",
  },
  statPillLabel: {
    fontSize: 9,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.5,
  },
  chevronWrap: {
    paddingTop: 2,
  },
  detailsContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  detailsLabel: {
    fontSize: 9,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  noResults: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
    paddingVertical: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 2,
    borderWidth: 1,
    marginBottom: 4,
    gap: 8,
  },
  contactLeft: { flex: 1, gap: 2 },
  contactName: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
  },
  contactPhone: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
  },
  contactError: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    marginTop: 2,
  },
  contactStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
  },
  contactStatusText: {
    fontSize: 9,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.5,
  },
  fullMessageLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
  },
  copyButtonText: {
    fontSize: 10,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.5,
  },
  fullMessageBox: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 12,
    marginBottom: 4,
  },
  fullMessageText: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    lineHeight: 20,
  },
  runningBanner: {
    flexDirection: "column",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 8,
    borderRadius: 2,
    borderWidth: 1,
    gap: 7,
  },
  runningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  runningDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  runningText: {
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1.2,
    flex: 1,
  },
  runningCount: {
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 0.5,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 2,
    borderWidth: 1,
    marginTop: 4,
  },
  exportBtnText: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: 0.3,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#f59e0b33",
    overflow: "hidden",
  },
  progressPct: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    color: "#f59e0b",
    letterSpacing: 0.5,
    minWidth: 32,
    textAlign: "right",
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "#f59e0b",
  },
});
