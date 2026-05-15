"use client";

import { usePlayMode } from "@/contexts/PlayModeContext";
import { PlayMode } from "@/utils/storage";
import styles from "@/styles/shared/PlayModeToggle.module.css";

export default function PlayModeToggle() {
  const { playMode, setPlayMode } = usePlayMode();

  return (
    <div className={styles.toggle}>
      {(["daily", "endless"] as PlayMode[]).map((mode) => (
        <button
          key={mode}
          className={`${styles.option} ${playMode === mode ? styles.active : ""}`}
          onClick={() => setPlayMode(mode)}
        >
          {mode === "daily" ? "Daily" : "Endless"}
        </button>
      ))}
    </div>
  );
}
