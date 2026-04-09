"use client";

import styles from "@/styles/GameControls.module.css";

interface GameControlsProps {
  onNewGame: () => void;
  onToggleReveal: () => void;
  showRevealButton: boolean;
  revealLabel: string;
}

export default function GameControls({
  onNewGame,
  onToggleReveal,
  showRevealButton,
  revealLabel,
}: GameControlsProps) {
  return (
    <div className={styles.gameSetup}>
      <button className={styles.displayButton} onClick={onNewGame}>
        NEW GAME
      </button>
      {showRevealButton && (
        <button className={styles.displayButton} onClick={onToggleReveal}>
          {revealLabel}
        </button>
      )}
    </div>
  );
}
