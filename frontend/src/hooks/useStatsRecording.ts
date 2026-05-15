"use client";

import { useEffect, useRef } from "react";
import { GameMode, recordResult, recordDailyResult } from "@/utils/storage";

export function useStatsRecording(
  mode: GameMode,
  hasWon: boolean,
  hasLost: boolean,
  guessCount: number,
  isDaily = false
): { resetStats: () => void } {
  // Starts true if restoring an already-finished game — prevents double-counting on reload
  const statsRecordedRef = useRef(hasWon || hasLost);

  const resetStats = () => { statsRecordedRef.current = false; };

  useEffect(() => {
    if (statsRecordedRef.current) return;
    if (hasWon || hasLost) {
      const record = isDaily ? recordDailyResult : recordResult;
      record(mode, hasWon, guessCount);
      statsRecordedRef.current = true;
    }
  }, [hasWon, hasLost, guessCount, mode, isDaily]);

  return { resetStats };
}
