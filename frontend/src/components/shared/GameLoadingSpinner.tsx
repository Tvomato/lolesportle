"use client";

import styles from "@/styles/shared/GameLoadingSpinner.module.css";

export default function GameLoadingSpinner() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.spinner} />
      <div className={styles.loadingText}>Loading</div>
    </div>
  );
}
