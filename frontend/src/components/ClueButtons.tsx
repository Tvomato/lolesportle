"use client";

import { useState, useEffect, useRef } from "react";
import { MdLock } from "react-icons/md";
import { Player } from "@/types";
import { getChampIconPath } from "@/utils/champIcon";
import ClueModal from "./ClueModal";
import styles from "@/styles/ClueButtons.module.css";

interface ClueButtonsProps {
  guessCount: number;
  currentPlayer: Player;
  gameOver: boolean;
  onClueClose?: () => void;
}

const CLUES = [
  { label: "Clue 1: Favourite Champs", threshold: 4 },
  { label: "Clue 2: Tier 1 Debut", threshold: 7 },
  { label: "Clue 3: Face", threshold: 10 },
];

function FavChampsContent({ favChamps }: { favChamps: string[] | undefined }) {
  if (!favChamps || favChamps.length === 0) {
    return (
      <p className={styles.emptyMessage}>
        No favourite champions listed for this player.
      </p>
    );
  }

  return (
    <div className={styles.champGrid}>
      {favChamps.map((name) => (
        <div className={styles.champItem} key={name}>
          <img
            src={getChampIconPath(name)}
            alt={name}
            className={styles.champIcon}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className={styles.champName}>{name}</span>
        </div>
      ))}
    </div>
  );
}

function Tier1DebutContent({ tier1Debut }: { tier1Debut: string | null }) {
  if (!tier1Debut) {
    return (
      <p className={styles.emptyMessage}>
        No debut date available for this player.
      </p>
    );
  }

  const date = new Date(tier1Debut + "T00:00:00Z");
  const formatted = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className={styles.debutContent}>
      <p className={styles.debutLabel}>
        This player first debuted in tier 1 in...
      </p>
      <p className={styles.debutDate}>{formatted}</p>
    </div>
  );
}

function FaceContent({ imageUrl }: { imageUrl: string }) {
  return (
    <div className={styles.faceContent}>
      <img
        src={imageUrl.split("/revision")[0]}
        alt="Player face"
        className={styles.faceImage}
      />
    </div>
  );
}

export default function ClueButtons({
  guessCount,
  currentPlayer,
  gameOver,
  onClueClose,
}: ClueButtonsProps) {
  const [justUnlocked, setJustUnlocked] = useState<Set<number>>(new Set());
  const [openClue, setOpenClue] = useState<number | null>(null);
  const hasAnimated = useRef<Set<number>>(new Set());

  useEffect(() => {
    const newlyUnlocked = new Set<number>();
    CLUES.forEach((clue, i) => {
      if (guessCount >= clue.threshold && !hasAnimated.current.has(i)) {
        newlyUnlocked.add(i);
        hasAnimated.current.add(i);
      }
    });
    if (newlyUnlocked.size > 0) {
      setJustUnlocked(newlyUnlocked);
      const timer = setTimeout(() => setJustUnlocked(new Set()), 2000);
      return () => clearTimeout(timer);
    }
  }, [guessCount]);

  return (
    <>
      <div className={styles.clueRow}>
        {CLUES.map((clue, i) => {
          const unlocked = gameOver || guessCount >= clue.threshold;
          const remaining = clue.threshold - guessCount;
          const glowing = justUnlocked.has(i);

          return (
            <button
              key={i}
              className={`${styles.clueButton} ${
                unlocked
                  ? glowing
                    ? styles.justUnlocked
                    : styles.unlocked
                  : styles.locked
              }`}
              disabled={!unlocked}
              onClick={() => unlocked && setOpenClue(i)}
              title={
                !unlocked
                  ? `Unlocks in ${remaining} guess${remaining === 1 ? "" : "es"}`
                  : clue.label
              }
            >
              {!unlocked && <MdLock className={styles.lockIcon} />}
              {clue.label}
              {!unlocked && (
                <span className={styles.remaining}>({remaining})</span>
              )}
            </button>
          );
        })}
      </div>

      {openClue !== null && (
        <ClueModal
          title={CLUES[openClue].label}
          onClose={() => { setOpenClue(null); onClueClose?.(); }}
        >
          {openClue === 0 && (
            <FavChampsContent favChamps={currentPlayer.fav_champs} />
          )}
          {openClue === 1 && (
            <Tier1DebutContent tier1Debut={currentPlayer.tier1_debut} />
          )}
          {openClue === 2 && (
            <FaceContent imageUrl={currentPlayer.image_url} />
          )}
        </ClueModal>
      )}
    </>
  );
}
