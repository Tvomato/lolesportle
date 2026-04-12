"use client";

import { useState, useEffect, useRef } from "react";
import { MdLock } from "react-icons/md";
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
              <MdLock className={styles.lockIcon} />
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
