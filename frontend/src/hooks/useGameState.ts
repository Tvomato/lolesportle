"use client";

import { useState, useEffect } from "react";
import { Player } from "@/types";
import { GameMode, loadGameState, saveGameState, clearGameState } from "@/utils/storage";

export interface GameState {
  currentPlayer: Player | null;
  guessedPlayers: Player[];
  guessedRawNames: Set<string>;
  showPlayer: boolean;
  hasLost: boolean;
  /** Classic mode only: tracks which guessed players have finished their flip animation */
  revealedPlayers: Set<string>;
  setCurrentPlayer: (p: Player | null) => void;
  setGuessedPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setGuessedRawNames: React.Dispatch<React.SetStateAction<Set<string>>>;
  setShowPlayer: (v: boolean) => void;
  setHasLost: (v: boolean) => void;
  setRevealedPlayers: React.Dispatch<React.SetStateAction<Set<string>>>;
  resetGame: () => void;
}

export function useGameState(mode: GameMode): GameState {
  const persisted = loadGameState(mode);

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(
    persisted?.currentPlayer ?? null
  );
  const [guessedPlayers, setGuessedPlayers] = useState<Player[]>(
    persisted?.guessedPlayers ?? []
  );
  const [guessedRawNames, setGuessedRawNames] = useState<Set<string>>(
    () => new Set(persisted?.guessedRawNames ?? [])
  );
  const [showPlayer, setShowPlayer] = useState(persisted?.showPlayer ?? false);
  const [hasLost, setHasLost] = useState(persisted?.hasLost ?? false);
  // All previously guessed players start revealed (no animation replay on load)
  const [revealedPlayers, setRevealedPlayers] = useState<Set<string>>(
    () => new Set(persisted?.guessedPlayers.map((p) => p.player) ?? [])
  );

  // Persist whenever game state changes
  useEffect(() => {
    if (!currentPlayer) return;
    saveGameState(mode, { currentPlayer, guessedPlayers, guessedRawNames, showPlayer, hasLost });
  }, [mode, currentPlayer, guessedPlayers, showPlayer, hasLost]);

  function resetGame() {
    clearGameState(mode);
    setCurrentPlayer(null);
    setGuessedPlayers([]);
    setGuessedRawNames(new Set());
    setShowPlayer(false);
    setHasLost(false);
    setRevealedPlayers(new Set());
  }

  return {
    currentPlayer,
    guessedPlayers,
    guessedRawNames,
    showPlayer,
    hasLost,
    revealedPlayers,
    setCurrentPlayer,
    setGuessedPlayers,
    setGuessedRawNames,
    setShowPlayer,
    setHasLost,
    setRevealedPlayers,
    resetGame,
  };
}
