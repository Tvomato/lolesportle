"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import styles from "@/styles/GuessTable.module.css";

interface FlipCellProps {
  animate: boolean;
  delayIndex: number;
  bgColor: string;
  children: ReactNode;
}

const FLIP_DURATION = 400;

export default function FlipCell({
  animate,
  delayIndex,
  bgColor,
  children,
}: FlipCellProps) {
  const wasAnimated = useRef(animate);
  const [flipped, setFlipped] = useState(!animate);

  useEffect(() => {
    if (wasAnimated.current && !flipped) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlipped(true);
        });
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!wasAnimated.current) {
    return (
      <div className={styles.cell} style={{ backgroundColor: bgColor }}>
        {children}
      </div>
    );
  }

  const delayMs = delayIndex * FLIP_DURATION;

  return (
    <div className={styles.flipContainer}>
      <div
        className={`${styles.flipInner} ${flipped ? styles.flipped : ""}`}
        style={{ transitionDelay: `${delayMs}ms` }}
      >
        <div className={styles.flipFront} />
        <div className={styles.flipBack} style={{ backgroundColor: bgColor }}>
          {children}
        </div>
      </div>
    </div>
  );
}
