"use client";

import { useState, useEffect, useRef } from "react";

export function useClueUnlocks(
  clues: Array<{ threshold: number }>,
  guessCount: number
): { justUnlocked: Set<number> } {
  const [justUnlocked, setJustUnlocked] = useState<Set<number>>(new Set());
  const hasAnimated = useRef<Set<number>>(new Set());

  useEffect(() => {
    const newlyUnlocked = new Set<number>();
    clues.forEach((clue, i) => {
      if (guessCount >= clue.threshold && !hasAnimated.current.has(i)) {
        newlyUnlocked.add(i);
        hasAnimated.current.add(i);
      }
    });
    if (newlyUnlocked.size > 0) {
      setJustUnlocked(newlyUnlocked);
      const timer = setTimeout(() => setJustUnlocked(new Set()), 2000);
      return () => clearTimeout(timer);
    }
  }, [guessCount, clues]);

  return { justUnlocked };
}
