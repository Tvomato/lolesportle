"use client";

import { useEffect, useRef } from "react";
import { GameMode } from "@/utils/storage";
import { recordResult } from "@/utils/storage";

export function useStatsRecording(
  mode: GameMode,
  hasWon: boolean,
  hasLost: boolean,
  guessCount: number
): { resetStats: () => void } {
  // Starts true if restoring an already-finished game — prevents double-counting on reload
  const statsRecordedRef = useRef(hasWon || hasLost);

  const resetStats = () => { statsRecordedRef.current = false; };

  useEffect(() => {
    if (statsRecordedRef.current) return;
    if (hasWon) {
      recordResult(mode, true, guessCount);
      statsRecordedRef.current = true;
    } else if (hasLost) {
      recordResult(mode, false, guessCount);
      statsRecordedRef.current = true;
    }
  }, [hasWon, hasLost, guessCount, mode]);

  return { resetStats };
}
