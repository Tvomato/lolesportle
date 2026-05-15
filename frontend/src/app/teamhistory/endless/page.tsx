import TeamHistoryBoard from "@/components/game-teamhistory/TeamHistoryBoard";
import styles from "@/styles/shared/GamePage.module.css";

export default function TeamHistoryEndlessPage() {
  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.pageTitle}>
        Team History <span className={styles.modeBadge}>(Endless)</span>
      </h1>
      <TeamHistoryBoard isDaily={false} />
    </div>
  );
}
