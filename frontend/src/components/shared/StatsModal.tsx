"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import { loadStats, ModeStats } from "@/utils/storage";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import styles from "@/styles/shared/StatsModal.module.css";

const TABS = [
  { key: "total", label: "Total" },
  { key: "classic", label: "Classic Mode" },
  { key: "face", label: "Guess by Face" },
  { key: "team-history", label: "Team History" },
] as const;
type TabKey = typeof TABS[number]["key"];

interface StatsModalProps {
  onClose: () => void;
}

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

function winRate(m: ModeStats): string {
  if (m.gamesPlayed === 0) return "—";
  return `${Math.round((m.wins / m.gamesPlayed) * 100)}%`;
}

function avgGuesses(m: ModeStats): string {
  if (m.gamesPlayed === 0) return "—";
  return fmt(m.totalGuesses / m.gamesPlayed);
}

function ModeStatsView({ m }: { m: ModeStats }) {
  if (m.gamesPlayed === 0) {
    return <p className={styles.noData}>No games played yet.</p>;
  }
  const rows: [string, string][] = [
    ["Games Played", String(m.gamesPlayed)],
    ["Games Won", String(m.wins)],
    ["Games Lost", String(m.losses)],
    ["Win Rate", winRate(m)],
    ["Average Guesses", avgGuesses(m)],
    ["Current Streak", String(m.currentStreak)],
    ["Longest Streak", String(m.maxStreak)],
  ];
  return (
    <div className={styles.statsSection}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.statRow}>
          <span className={styles.statLabel}>{label}</span>
          <span className={styles.statValue}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function TotalStatsView({ classic, face, teamHistory }: { classic: ModeStats; face: ModeStats; teamHistory: ModeStats }) {
  const gamesPlayed = classic.gamesPlayed + face.gamesPlayed + teamHistory.gamesPlayed;
  if (gamesPlayed === 0) {
    return <p className={styles.noData}>No games played yet.</p>;
  }
  const wins = classic.wins + face.wins + teamHistory.wins;
  const losses = classic.losses + face.losses + teamHistory.losses;
  const totalGuesses = classic.totalGuesses + face.totalGuesses + teamHistory.totalGuesses;
  const avgG = gamesPlayed > 0 ? fmt(totalGuesses / gamesPlayed) : "—";
  const rate = gamesPlayed > 0 ? `${Math.round((wins / gamesPlayed) * 100)}%` : "—";

  const rows: [string, string][] = [
    ["Games Played", String(gamesPlayed)],
    ["Games Won", String(wins)],
    ["Games Lost", String(losses)],
    ["Win Rate", rate],
    ["Average Guesses", avgG],
  ];
  return (
    <div className={styles.statsSection}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.statRow}>
          <span className={styles.statLabel}>{label}</span>
          <span className={styles.statValue}>{value}</span>
        </div>
      ))}
      <p className={styles.streakNote}>See individual mode tabs for streaks.</p>
    </div>
  );
}

export default function StatsModal({ onClose }: StatsModalProps) {
  const { closing, handleClose, handleAnimationEnd } = useModalAnimation(onClose);
  const [activeTab, setActiveTab] = useState<TabKey>("total");
  const stats = loadStats();

  return createPortal(
    <div
      className={`${styles.backdrop} ${closing ? styles.backdropOut : ""}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.modal} ${closing ? styles.flyOut : styles.flyIn}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Statistics</h3>
          <button className={styles.closeButton} onClick={handleClose}>
            <MdClose size={18} />
          </button>
        </div>

        <div className={styles.tabBar}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "total" && (
          <TotalStatsView classic={stats.classic} face={stats.face} teamHistory={stats["team-history"]} />
        )}
        {activeTab === "classic" && <ModeStatsView m={stats.classic} />}
        {activeTab === "face" && <ModeStatsView m={stats.face} />}
        {activeTab === "team-history" && <ModeStatsView m={stats["team-history"]} />}
      </div>
    </div>,
    document.body
  );
}
