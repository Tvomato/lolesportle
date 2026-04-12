"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/styles/ClueButtons.module.css";

interface ClueButtonsProps {
  guessCount: number;
}

const CLUES = [
  { label: "Clue 1: Favourite Champs", threshold: 4 },
  { label: "Clue 2: Tier 1 Debut", threshold: 7 },
  { label: "Clue 3: Face", threshold: 10 },
];

export default function ClueButtons({ guessCount }: ClueButtonsProps) {
  const [justUnlocked, setJustUnlocked] = useState<Set<number>>(new Set());
  const hasAnimated = useRef<Set<number>>(new Set());

  useEffect(() => {
    const newlyUnlocked = new Set<number>();
    CLUES.forEach((clue, i) => {
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
  }, [guessCount]);

  return (
    <div className={styles.clueRow}>
      {CLUES.map((clue, i) => {
        const unlocked = guessCount >= clue.threshold;
        const remaining = clue.threshold - guessCount;
        const glowing = justUnlocked.has(i);

        return (
          <button
            key={i}
            className={`${styles.clueButton} ${
              unlocked
                ? glowing
                  ? styles.justUnlocked
                  : styles.unlocked
                : styles.locked
            }`}
            disabled={!unlocked}
            title={!unlocked ? `Unlocks in ${remaining} guess${remaining === 1 ? "" : "es"}` : clue.label}
          >
            {!unlocked && (
              <svg
                className={styles.lockIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
              </svg>
            )}
            {clue.label}
            {!unlocked && (
              <span className={styles.remaining}>({remaining})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
