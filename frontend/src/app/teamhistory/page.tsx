import TeamHistoryBoard from "@/components/game-teamhistory/TeamHistoryBoard";
import styles from "@/styles/shared/GamePage.module.css";

export default function TeamHistoryPage() {
  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.pageTitle}>Team History</h1>
      <TeamHistoryBoard isDaily={true} />
    </div>
  );
}
