"use client";

import { useEffect, useRef } from "react";

/**
 * Fires `startGame` once when daily mode is active and the board has finished
 * loading with no restored game state. The callback ref pattern avoids listing
 * the (unstable) async function in deps while keeping the effect dependency
 * array exhaustive for the stable boolean flags.
 */
export function useDailyAutoStart(
  isDaily: boolean,
  loading: boolean,
  noPlayers: boolean,
  hasPlayer: boolean,
  startGame: () => void
): void {
  const startGameRef = useRef(startGame);
  startGameRef.current = startGame;

  useEffect(() => {
    if (isDaily && !loading && !noPlayers && !hasPlayer) {
      startGameRef.current();
    }
  }, [isDaily, loading, noPlayers, hasPlayer]);
}
