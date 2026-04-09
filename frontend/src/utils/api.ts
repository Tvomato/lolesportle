import { PlayerRaw, PlayerName, Team } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function fetchPlayerNames(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/players/tournaments`);
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
