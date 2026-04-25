"use client";

import styles from "@/styles/shared/NoPlayersMessage.module.css";

export default function NoPlayersMessage() {
  return (
    <div className={styles.emptyError}>
      No valid players found for the current query.
      <span>Try adjusting the filters in settings.</span>
    </div>
  );
}
