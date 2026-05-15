import GameBoard from "@/components/game-classic/GameBoard";
import styles from "@/styles/shared/GamePage.module.css";

export default function ClassicEndlessPage() {
  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.pageTitle}>
        Classic Mode <span className={styles.modeBadge}>(Endless)</span>
      </h1>
      <GameBoard isDaily={false} />
    </div>
  );
}
