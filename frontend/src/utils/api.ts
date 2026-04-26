import { PlayerRaw, PlayerName, Team } from "@/types";
import { PlayerQuerySettings } from "@/utils/storage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function fetchPlayerNames(settings?: PlayerQuerySettings, minTeams?: number): Promise<string[]> {
  const params = new URLSearchParams();
  if (settings) {
    params.set("start_year", String(settings.start_year));
    params.set("end_year", String(settings.end_year));
    params.set("tourny_count", String(settings.tourny_count));
    params.set("include_retired", String(settings.include_retired));
    params.set("include_current_year", String(settings.include_current_year));
  }
  if (minTeams !== undefined) {
    params.set("min_teams", String(minTeams));
  }
  const res = await fetch(`${API_BASE}/api/players?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch player names: ${res.status}`);
  const data: PlayerName[] = await res.json();
  return data.map((p) => p.player);
}

export async function fetchPlayerDetails(
  playerId: string
): Promise<PlayerRaw> {
  const res = await fetch(
    `${API_BASE}/api/player/${encodeURIComponent(playerId)}`
  );
  if (!res.ok)
    throw new Error(`Failed to fetch player details: ${res.status}`);
  return res.json();
}

export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`${API_BASE}/api/teams`);
  if (!res.ok) throw new Error(`Failed to fetch teams: ${res.status}`);
  return res.json();
}
