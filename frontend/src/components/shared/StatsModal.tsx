"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { loadStats, loadDailyStats, ModeStats, PlayMode } from "@/utils/storage";
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
  initialPlayMode?: PlayMode;
}

function winRate(m: ModeStats): string {
  if (m.gamesPlayed === 0) return "—";
  return `${Math.round((m.wins / m.gamesPlayed) * 100)}%`;
}

function avgGuesses(m: ModeStats): string {
  if (m.gamesPlayed === 0) return "—";
  return (m.totalGuesses / m.gamesPlayed).toFixed(1);
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
  const avgG = gamesPlayed > 0 ? (totalGuesses / gamesPlayed).toFixed(1) : "—";
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

export default function StatsModal({ onClose, initialPlayMode = "endless" }: StatsModalProps) {
  const { closing, handleClose, handleAnimationEnd } = useModalAnimation(onClose);
  const [activeTab, setActiveTab] = useState<TabKey>("total");
  const [selectedPlayMode, setSelectedPlayMode] = useState<PlayMode>(initialPlayMode);

  const stats = selectedPlayMode === "daily" ? loadDailyStats() : loadStats();

  const tabBarRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [thumbInfo, setThumbInfo] = useState({ widthPct: 100, leftPct: 0 });

  const updateScrollState = useCallback(() => {
    const el = tabBarRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    const widthPct = (el.clientWidth / el.scrollWidth) * 100;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const leftPct = maxScroll > 0 ? (el.scrollLeft / maxScroll) * (100 - widthPct) : 0;
    setThumbInfo({ widthPct, leftPct });
  }, []);

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  const scrollTabs = (dir: "left" | "right") => {
    tabBarRef.current?.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  const trackRef = useRef<HTMLDivElement>(null);

  const moveTrackScroll = (clientX: number) => {
    const track = trackRef.current;
    const bar = tabBarRef.current;
    if (!track || !bar) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    bar.scrollLeft = ratio * (bar.scrollWidth - bar.clientWidth);
  };

  const scrollTabIntoView = (tabEl: HTMLButtonElement) => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const PADDING = 40;
    const barRect = bar.getBoundingClientRect();
    const tabRect = tabEl.getBoundingClientRect();
    if (tabRect.left < barRect.left + PADDING) {
      bar.scrollTo({ left: bar.scrollLeft - (barRect.left + PADDING - tabRect.left), behavior: "smooth" });
    } else if (tabRect.right > barRect.right - PADDING) {
      bar.scrollTo({ left: bar.scrollLeft + (tabRect.right - (barRect.right - PADDING)), behavior: "smooth" });
    }
  };

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

        <div className={styles.playModeToggle}>
          {(["daily", "endless"] as PlayMode[]).map((mode) => (
            <button
              key={mode}
              className={`${styles.playModeOption} ${selectedPlayMode === mode ? styles.playModeActive : ""}`}
              onClick={() => setSelectedPlayMode(mode)}
            >
              {mode === "daily" ? "Daily" : "Endless"}
            </button>
          ))}
        </div>

        <div className={styles.tabBarWrapper}>
          {canScrollLeft && <div className={`${styles.fadeEdge} ${styles.fadeEdgeLeft}`} />}
          {canScrollRight && <div className={`${styles.fadeEdge} ${styles.fadeEdgeRight}`} />}
          <div className={styles.tabBar} ref={tabBarRef}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
                onClick={(e) => {
                  setActiveTab(tab.key);
                  scrollTabIntoView(e.currentTarget);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {canScrollLeft && (
            <button
              className={`${styles.scrollArrow} ${styles.scrollArrowLeft}`}
              onClick={() => scrollTabs("left")}
              tabIndex={-1}
            >
              <MdChevronLeft size={13} />
            </button>
          )}
          {canScrollRight && (
            <button
              className={`${styles.scrollArrow} ${styles.scrollArrowRight}`}
              onClick={() => scrollTabs("right")}
              tabIndex={-1}
            >
              <MdChevronRight size={13} />
            </button>
          )}
          <div
            className={styles.scrollTrack}
            ref={trackRef}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              moveTrackScroll(e.clientX);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 0) return;
              moveTrackScroll(e.clientX);
            }}
          >
            <div className={styles.scrollTrackInner}>
              <div
                className={styles.scrollThumb}
                style={{ width: `${thumbInfo.widthPct}%`, left: `${thumbInfo.leftPct}%` }}
              />
            </div>
          </div>
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
