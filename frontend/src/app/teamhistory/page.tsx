"use client";

import { usePlayMode } from "@/contexts/PlayModeContext";
import TeamHistoryBoard from "@/components/game-teamhistory/TeamHistoryBoard";
import GameLoadingSpinner from "@/components/shared/GameLoadingSpinner";
import styles from "@/styles/shared/GamePage.module.css";

export default function TeamHistoryPage() {
  const { isMounted } = usePlayMode();
  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.pageTitle}>Team History</h1>
      {isMounted ? <TeamHistoryBoard /> : <GameLoadingSpinner />}
    </div>
  );
}
