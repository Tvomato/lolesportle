import { Player } from "@/types";

export type GameMode = "classic" | "face";

export interface PersistedGameState {
  version: number;
  mode: GameMode;
  currentPlayer: Player;
  guessedPlayers: Player[];
  /** Raw player name strings (from fetchPlayerNames) used to filter the search bar */
  guessedRawNames: string[];
  showPlayer: boolean;
  hasLost: boolean;
  savedAt: string;
}

// Reserved for future statistics feature:
// export interface ModeStats { gamesPlayed, wins, losses, currentStreak, maxStreak, guessCounts, lastPlayedDate }
// export interface GameStats { version, classic: ModeStats, face: ModeStats }
// Use STORAGE_KEYS.stats to read/write stats via loadStats() / saveStats() (to be implemented).

const GAME_STATE_VERSION = 1;
const GAME_STATE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const STORAGE_KEYS = {
  classic: "lolesportle_classic_game",
  face: "lolesportle_face_game",
  stats: "lolesportle_stats",
} as const;

export function loadGameState(mode: GameMode): PersistedGameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[mode]);
    if (!raw) return null;
    const parsed: PersistedGameState = JSON.parse(raw);
    if (parsed.version !== GAME_STATE_VERSION) return null;
    if (Date.now() - new Date(parsed.savedAt).getTime() > GAME_STATE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEYS[mode]);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveGameState(mode: GameMode, state: Omit<PersistedGameState, "version" | "mode" | "savedAt" | "guessedRawNames"> & { guessedRawNames: Set<string> }): void {
  try {
    const payload: PersistedGameState = {
      ...state,
      guessedRawNames: Array.from(state.guessedRawNames),
      version: GAME_STATE_VERSION,
      mode,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS[mode], JSON.stringify(payload));
  } catch {
    // Silently ignore storage errors (e.g. private browsing quota exceeded)
  }
}

export function clearGameState(mode: GameMode): void {
  try {
    localStorage.removeItem(STORAGE_KEYS[mode]);
  } catch {
    // ignore
  }
}
