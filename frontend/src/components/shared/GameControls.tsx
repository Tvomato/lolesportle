"use client";

import styles from "@/styles/shared/GameControls.module.css";

interface NewGameButtonProps {
  onNewGame: () => void;
  loading?: boolean;
}

interface GiveUpButtonProps {
  onGiveUp: () => void;
}

export function NewGameButton({ onNewGame, loading }: NewGameButtonProps) {
  return (
    <div className={styles.newGameWrapper}>
      <button
        className={`${styles.displayButton}${loading ? ` ${styles.loadingButton}` : ""}`}
        onClick={onNewGame}
        disabled={loading}
      >
        {loading ? "LOADING..." : "NEW GAME"}
      </button>
    </div>
  );
}

export function GiveUpButton({ onGiveUp }: GiveUpButtonProps) {
  return (
    <div className={styles.giveUpWrapper}>
      <button className={styles.displayButton} onClick={onGiveUp}>
        GIVE UP?
      </button>
    </div>
  );
}
