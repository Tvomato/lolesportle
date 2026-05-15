import FaceBoard from "@/components/game-face/FaceBoard";
import styles from "@/styles/shared/GamePage.module.css";

export default function FaceEndlessPage() {
  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.pageTitle}>
        Guess by Face <span className={styles.modeBadge}>(Endless)</span>
      </h1>
      <FaceBoard isDaily={false} />
    </div>
  );
}
