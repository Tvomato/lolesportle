"use client";

import { getFullSizeImageUrl } from "@/utils/playerImage";
import styles from "@/styles/game-face/FaceImage.module.css";

interface FaceImageZoomProps {
  imageUrl: string | null;
  guessCount: number;
  revealed: boolean;
}

const SCALE_MAX = 6;
const SCALE_MIN = 1;
const TOTAL_STEPS = 10;

export default function FaceImageZoom({
  imageUrl,
  guessCount,
  revealed,
}: FaceImageZoomProps) {
  const t = Math.min(1, guessCount / TOTAL_STEPS);
  const scale = revealed ? SCALE_MIN : SCALE_MAX - (SCALE_MAX - SCALE_MIN) * t;

  return (
    <div className={styles.frame}>
      {imageUrl ? (
        <img
          src={getFullSizeImageUrl(imageUrl)}
          alt="Mystery player"
          className={`${styles.image} ${styles.imageZoom}`}
          style={{ transform: `scale(${scale})` }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <div className={styles.empty}>No image</div>
      )}
    </div>
  );
}
