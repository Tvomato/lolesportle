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

export interface GameResult {
  won: boolean;
  guesses: number;
  date: string;
}

export interface ModeStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalGuesses: number;
  currentStreak: number;
  maxStreak: number;
  guessCounts: Record<string, number>;
  history: GameResult[];
}

export interface GameStats {
  version: number;
  classic: ModeStats;
  face: ModeStats;
}

const GAME_STATE_VERSION = 1;
const GAME_STATE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const STATS_VERSION = 1;

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

function emptyModeStats(): ModeStats {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    totalGuesses: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessCounts: {},
    history: [],
  };
}

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.stats);
    if (!raw) return { version: STATS_VERSION, classic: emptyModeStats(), face: emptyModeStats() };
    const parsed: GameStats = JSON.parse(raw);
    if (parsed.version !== STATS_VERSION) return { version: STATS_VERSION, classic: emptyModeStats(), face: emptyModeStats() };
    return parsed;
  } catch {
    return { version: STATS_VERSION, classic: emptyModeStats(), face: emptyModeStats() };
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function recordResult(mode: GameMode, won: boolean, guesses: number): void {
  const stats = loadStats();
  const m = stats[mode];

  m.gamesPlayed++;
  m.totalGuesses += guesses;
  m.guessCounts[String(guesses)] = (m.guessCounts[String(guesses)] ?? 0) + 1;

  const result: GameResult = { won, guesses, date: new Date().toISOString() };
  m.history = [...m.history, result].slice(-100);

  if (won) {
    m.wins++;
    m.currentStreak++;
    if (m.currentStreak > m.maxStreak) m.maxStreak = m.currentStreak;
  } else {
    m.losses++;
    m.currentStreak = 0;
  }

  saveStats(stats);
}
