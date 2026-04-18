"use client";

import { useEffect, useState } from "react";
import { decode } from "html-entities";
import { Player } from "@/types";
import { getFullSizeImageUrl } from "@/utils/playerImage";
import styles from "@/styles/game-face/FaceGuessRow.module.css";

type Variant = "correct" | "incorrect" | "neutral";

interface FaceGuessRowProps {
  player: Player;
  variant: Variant;
  /** Set to true only for the newly-added row so it runs the shake/pop animation once. */
  justGuessed: boolean;
}

export default function FaceGuessRow({
  player,
  variant,
  justGuessed,
}: FaceGuessRowProps) {
  const [animating, setAnimating] = useState(justGuessed);

  useEffect(() => {
    if (!justGuessed) return;
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [justGuessed]);

  const variantClass =
    variant === "correct"
      ? styles.correct
      : variant === "neutral"
        ? styles.neutral
        : styles.incorrect;

  const animationClass = animating
    ? variant === "correct"
      ? styles.popIn
      : variant === "incorrect"
        ? styles.shake
        : ""
    : "";

  return (
    <div className={`${styles.row} ${variantClass} ${animationClass}`}>
      <img
        src={getFullSizeImageUrl(player.image_url)}
        alt={player.player}
        className={styles.face}
      />
      <div className={styles.name}>{decode(player.player)}</div>
    </div>
  );
}
