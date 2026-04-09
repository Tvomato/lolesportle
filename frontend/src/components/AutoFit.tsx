"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import styles from "@/styles/GuessTable.module.css";

interface AutoFitProps {
  children: ReactNode;
}

export default function AutoFit({ children }: AutoFitProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // Reset scale to measure natural size
    setScale(1);
    requestAnimationFrame(() => {
      const oh = outer.clientHeight;
      const ow = outer.clientWidth;
      const ih = inner.scrollHeight;
      const iw = inner.scrollWidth;
      if (ih > oh || iw > ow) {
        const s = Math.min(oh / ih, ow / iw, 1);
        setScale(Math.max(s, 0.55)); // don't shrink below 55%
      }
    });
  }, [children]);

  return (
    <div ref={outerRef} className={styles.autoFit}>
      <div
        ref={innerRef}
        style={{
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
