"use client";

import { usePlayMode } from "@/contexts/PlayModeContext";
import GameBoard from "@/components/game-classic/GameBoard";
import GameLoadingSpinner from "@/components/shared/GameLoadingSpinner";
import styles from "@/styles/shared/GamePage.module.css";

export default function ClassicPage() {
  const { isMounted } = usePlayMode();
  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.pageTitle}>Classic Mode</h1>
      {isMounted ? <GameBoard /> : <GameLoadingSpinner />}
    </div>
  );
}
