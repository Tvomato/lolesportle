"use client";

import { usePlayMode } from "@/contexts/PlayModeContext";
import FaceBoard from "@/components/game-face/FaceBoard";
import GameLoadingSpinner from "@/components/shared/GameLoadingSpinner";
import styles from "@/styles/shared/GamePage.module.css";

export default function FacePage() {
  const { isMounted } = usePlayMode();
  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.pageTitle}>Guess by Face</h1>
      {isMounted ? <FaceBoard /> : <GameLoadingSpinner />}
    </div>
  );
}
