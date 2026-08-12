"use client";

import { ReactNode } from "react";
import Link from "next/link";
import DailyCountdown from "@/components/shared/DailyCountdown";
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

interface DailyGameOverControlsProps {
  nextHref: string;
  nextLabel: string;
  nextIcon: ReactNode;
}

export function DailyGameOverControls({ nextHref, nextLabel, nextIcon }: DailyGameOverControlsProps) {
  return (
    <div className={styles.dailyGameOverWrapper}>
      <DailyCountdown />
      <div className={styles.nextModeSection}>
        <p className={styles.nextModeLabel}>Next Mode:</p>
        <Link href={nextHref} className={styles.nextModeButton}>
          <span className={styles.nextModeIcon}>{nextIcon}</span>
          {nextLabel}
        </Link>
      </div>
    </div>
  );
}
