"use client";

import { getFullSizeImageUrl } from "@/utils/playerImage";
import styles from "@/styles/game-face/FaceImage.module.css";

interface FaceImageBlurredProps {
  imageUrl: string | null;
  guessCount: number;
  revealed: boolean;
}

const BLUR_MAX = 40;
const TOTAL_STEPS = 10;

export default function FaceImageBlurred({
  imageUrl,
  guessCount,
  revealed,
}: FaceImageBlurredProps) {
  const blur = revealed
    ? 0
    : Math.max(0, BLUR_MAX * (1 - Math.min(guessCount, TOTAL_STEPS) / TOTAL_STEPS));

  return (
    <div className={styles.frame}>
      {imageUrl ? (
        <img
          src={getFullSizeImageUrl(imageUrl)}
          alt="Mystery player"
          className={`${styles.image} ${styles.imageBlurred}`}
          style={{ filter: `blur(${blur}px)` }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <div className={styles.empty}>No image</div>
      )}
    </div>
  );
}
