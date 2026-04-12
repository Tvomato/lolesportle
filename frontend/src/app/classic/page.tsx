import GameBoard from "@/components/GameBoard";
import styles from "@/styles/ClassicPage.module.css";

export default function ClassicPage() {
  return (
    <div className={styles.gameWrapper}>
      <GameBoard />
    </div>
  );
}
