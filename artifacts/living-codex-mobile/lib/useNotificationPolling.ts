/**
 * Polls the API every 30 seconds and fires local push notifications when:
 *  - A new lead is discovered (score ≥ 60)
 *  - A message transitions to "replied" status
 *
 * Tracks seen IDs in refs so the first fetch never triggers spurious alerts.
 */

import {
  ListMessagesStatus,
  listLeads,
  listMessages,
} from "@workspace/api-client-react";
import { useEffect, useRef } from "react";
import {
  notifyNewLead,
  notifyNewReply,
  requestNotificationPermissions,
} from "./notifications";

const POLL_INTERVAL_MS = 30_000;
const HOT_LEAD_SCORE_THRESHOLD = 60;

export function useNotificationPolling(): void {
  const permGranted = useRef(false);
  const seenLeadIds = useRef<Set<number>>(new Set());
  const seenRepliedIds = useRef<Set<number>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function fetchAndNotify() {
      if (!permGranted.current) return;

      try {
        const [leadsRes, msgsRes] = await Promise.allSettled([
          listLeads(),
          listMessages({ status: ListMessagesStatus.replied }),
        ]);

        // ── New hot leads ────────────────────────────────────────────────────
        if (leadsRes.status === "fulfilled" && leadsRes.value) {
          const raw = leadsRes.value as
            | Array<{ id: number; name: string; score: number }>
            | { data?: Array<{ id: number; name: string; score: number }> };
          const leads = Array.isArray(raw) ? raw : (raw.data ?? []);

          for (const lead of leads) {
            const isNew = !seenLeadIds.current.has(lead.id);
            seenLeadIds.current.add(lead.id);
            if (isNew && initialized.current && lead.score >= HOT_LEAD_SCORE_THRESHOLD) {
              await notifyNewLead(lead.name, lead.score);
            }
          }
        }

        // ── New replies ──────────────────────────────────────────────────────
        if (msgsRes.status === "fulfilled" && msgsRes.value) {
          const raw = msgsRes.value as
            | Array<{ id: number; subject: string; channel: string }>
            | { data?: Array<{ id: number; subject: string; channel: string }> };
          const msgs = Array.isArray(raw) ? raw : (raw.data ?? []);

          for (const msg of msgs) {
            const isNew = !seenRepliedIds.current.has(msg.id);
            seenRepliedIds.current.add(msg.id);
            if (isNew && initialized.current) {
              await notifyNewReply(msg.subject, msg.channel);
            }
          }
        }

        // Mark baseline established — subsequent polls fire real alerts
        initialized.current = true;
      } catch {
        // Network unavailable — silently skip
      }
    }

    async function setup() {
      permGranted.current = await requestNotificationPermissions();
      if (cancelled) return;

      // Run immediately, then on interval
      await fetchAndNotify();

      if (!cancelled) {
        interval = setInterval(() => {
          if (!cancelled) fetchAndNotify();
        }, POLL_INTERVAL_MS);
      }
    }

    setup();

    return () => {
      cancelled = true;
      if (interval !== null) clearInterval(interval);
    };
  }, []);
}
