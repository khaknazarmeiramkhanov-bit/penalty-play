import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CLIENT_KEY = "penalty-client-id";

export function getClientId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = window.localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

export type PlayerRow = {
  id: string;
  client_id: string;
  name: string;
  wins: number;
  losses: number;
  matches: number;
};

export async function syncPlayer(stats: {
  name: string;
  wins: number;
  losses: number;
  matches: number;
}) {
  const client_id = getClientId();
  await supabase
    .from("players")
    .upsert(
      {
        client_id,
        name: stats.name.slice(0, 20),
        wins: stats.wins,
        losses: stats.losses,
        matches: stats.matches,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id" },
    );
}

export function useLeaderboard(limit = 50) {
  const [rows, setRows] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase
        .from("players")
        .select("id, client_id, name, wins, losses, matches")
        .order("wins", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(limit);
      if (alive && data) setRows(data as PlayerRow[]);
      if (alive) setLoading(false);
    };
    load();
    const onChange = () => load();
    window.addEventListener("penalty-shop-change", onChange);
    const interval = window.setInterval(load, 15000);
    return () => {
      alive = false;
      window.removeEventListener("penalty-shop-change", onChange);
      window.clearInterval(interval);
    };
  }, [limit]);

  return { rows, loading, myClientId: getClientId() };
}