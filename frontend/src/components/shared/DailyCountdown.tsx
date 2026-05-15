"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/shared/DailyCountdown.module.css";

function getSecondsUntilReset(): number {
  const now = new Date();
  // Next reset is the next 08:00 UTC (= 3 AM EST)
  const next = new Date(now);
  next.setUTCHours(8, 0, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return Math.floor((next.getTime() - now.getTime()) / 1000);
}

function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function DailyCountdown() {
  const [seconds, setSeconds] = useState(getSecondsUntilReset);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(getSecondsUntilReset());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.wrapper}>
      <p className={styles.subLabel}>Next player in</p>
      <p className={styles.timer}>{formatCountdown(seconds)}</p>
    </div>
  );
}
