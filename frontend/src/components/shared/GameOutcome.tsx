"use client";

import styles from "@/styles/shared/GameOutcome.module.css";

interface GameOutcomeProps {
  hasWon: boolean;
  hasLost: boolean;
  guessCount: number;
  compact?: boolean;
}

export default function GameOutcome({ hasWon, hasLost, guessCount, compact = false }: GameOutcomeProps) {
  return (
    <>
      {hasWon && <div className={`${styles.victoryText} ${compact ? styles.compact : ""}`}>YOU WIN!</div>}
      {hasLost && !hasWon && <div className={`${styles.defeatText} ${compact ? styles.compact : ""}`}>YOU LOSE!</div>}
      {(hasWon || hasLost) && <div className={styles.attemptsText}>Total guesses: {guessCount}</div>}
    </>
  );
}
