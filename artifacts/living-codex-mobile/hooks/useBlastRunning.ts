import { useQuery } from "@tanstack/react-query";

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

interface CampaignHistoryItem {
  id: number;
  finishedAt: string | null;
}

export function useBlastRunning(): boolean {
  const { data } = useQuery<CampaignHistoryItem[]>({
    queryKey: ["campaigns", "history"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/campaigns/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<CampaignHistoryItem[]>;
    },
    staleTime: 5_000,
    refetchInterval: (q) => {
      const rows =
        (q.state.data as CampaignHistoryItem[] | undefined) ?? [];
      return rows.some((c) => c.finishedAt === null) ? 5_000 : 30_000;
    },
  });

  return (data ?? []).some((c) => c.finishedAt === null);
}
