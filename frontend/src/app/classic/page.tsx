import GameBoard from "@/components/GameBoard";
import styles from "@/styles/ClassicPage.module.css";

export default function ClassicPage() {
  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.pageTitle}>Classic Mode</h1>
      <GameBoard />
    </div>
  );
}
