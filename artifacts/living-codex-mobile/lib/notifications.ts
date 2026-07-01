/**
 * Notifications module for Autonomous Revenue OS Mobile.
 *
 * Handles permission requests, notification scheduling, and background polling
 * that alerts the user when agents discover new leads or receive message replies.
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ── Handler configuration ─────────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── Permission request ────────────────────────────────────────────────────────

type PermStatus = { granted: boolean; canAskAgain: boolean };

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  // NotificationPermissionsStatus extends PermissionResponse from `expo`, but the
  // TypeScript resolution chain is broken in this expo-notifications version — cast
  // to access the `granted` field that IS present at runtime.
  const existing = (await Notifications.getPermissionsAsync()) as unknown as PermStatus;
  if (existing.granted) return true;

  const result = (await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  })) as unknown as PermStatus;

  return result.granted;
}

// ── Schedule local notifications ──────────────────────────────────────────────

export async function notifyNewLead(leadName: string, score: number): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥 New Hot Lead Discovered",
      body: `${leadName} — quality score ${score}/100`,
      data: { screen: "leads" },
      color: "#ff6600",
    },
    trigger: null,
  });
}

export async function notifyNewReply(senderName: string, channel: string): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💬 Reply Received",
      body: `${senderName} responded via ${channel}`,
      data: { screen: "outreach" },
      color: "#ff6600",
    },
    trigger: null,
  });
}

export async function notifyDealWon(dealTitle: string, value: number): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🏆 Deal Won!",
      body: `${dealTitle} — $${value.toLocaleString()}`,
      data: { screen: "pipeline" },
      color: "#22c55e",
    },
    trigger: null,
  });
}

// ── Badge management ──────────────────────────────────────────────────────────

export async function clearBadge(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.setBadgeCountAsync(0);
}
