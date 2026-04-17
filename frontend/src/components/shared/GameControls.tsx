"use client";

import styles from "@/styles/shared/GameControls.module.css";

interface GameControlsProps {
  onNewGame: () => void;
  onGiveUp: () => void;
  hasLost: boolean;
}

export default function GameControls({ onNewGame, onGiveUp, hasLost }: GameControlsProps) {
  return (
    <div className={styles.gameSetup}>
      {hasLost ? (
        <button className={styles.displayButton} onClick={onNewGame}>
          NEW GAME
        </button>
      ) : (
        <button className={styles.displayButton} onClick={onGiveUp}>
          GIVE UP?
        </button>
      )}
    </div>
  );
}
