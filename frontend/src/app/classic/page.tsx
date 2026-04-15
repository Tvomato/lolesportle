import GameBoard from "@/components/game-classic/GameBoard";
import styles from "@/styles/game-classic/ClassicPage.module.css";

export default function ClassicPage() {
  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.pageTitle}>Classic Mode</h1>
      <GameBoard />
    </div>
  );
}
