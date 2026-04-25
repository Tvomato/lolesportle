import FaceBoard from "@/components/game-face/FaceBoard";
import styles from "@/styles/shared/GamePage.module.css";

export default function FacePage() {
  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.pageTitle}>Guess by Face</h1>
      <FaceBoard />
    </div>
  );
}
