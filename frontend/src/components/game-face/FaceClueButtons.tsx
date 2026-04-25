"use client";

import { useState } from "react";
import { MdLock } from "react-icons/md";
import { Player, Team } from "@/types";
import { getFullSizeImageUrl } from "@/utils/playerImage";
import { useClueUnlocks } from "@/hooks/useClueUnlocks";
import ClueModal from "@/components/game-classic/ClueModal";
import styles from "@/styles/game-face/FaceClueButtons.module.css";

interface FaceClueButtonsProps {
  guessCount: number;
  currentPlayer: Player;
  teamMap: Map<string, Team>;
  gameOver: boolean;
  onClueClose?: () => void;
}

const CLUES = [
  { label: "Clue 1: Full Name", threshold: 4 },
  { label: "Clue 2: Current Team", threshold: 8 },
];

function TeamContent({
  teamName,
  logoUrl,
}: {
  teamName: string | null;
  logoUrl: string | undefined;
}) {
  if (!teamName) {
    return (
      <p className={styles.emptyMessage}>
        This player is not currently on a team.
      </p>
    );
  }

  return (
    <div className={styles.teamContent}>
      {logoUrl && (
        <img
          src={getFullSizeImageUrl(logoUrl)}
          alt={teamName}
          className={styles.teamLogo}
        />
      )}
      <p className={styles.teamName}>{teamName}</p>
    </div>
  );
}

function FullNameContent({
  fullName,
  nativeName,
}: {
  fullName: string;
  nativeName: string | null;
}) {
  return (
    <div className={styles.fullNameContent}>
      <p className={styles.fullNameLabel}>This player&apos;s full name is...</p>
      <p className={styles.fullName}>
        {fullName}
        {nativeName && (
          <span> ({nativeName})</span>
        )}
      </p>
    </div>
  );
}

export default function FaceClueButtons({
  guessCount,
  currentPlayer,
  teamMap,
  gameOver,
  onClueClose,
}: FaceClueButtonsProps) {
  const { justUnlocked } = useClueUnlocks(CLUES, guessCount);
  const [openClue, setOpenClue] = useState<number | null>(null);

  const teamLogoUrl = currentPlayer.team_name
    ? teamMap.get(currentPlayer.team_name)?.logo_url
    : undefined;

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
          onClose={() => {
            setOpenClue(null);
            onClueClose?.();
          }}
        >
          {openClue === 0 && (
            <FullNameContent
              fullName={currentPlayer.name}
              nativeName={currentPlayer.native_name}
            />
          )}
          {openClue === 1 && (
            <TeamContent
              teamName={currentPlayer.team_name}
              logoUrl={teamLogoUrl}
            />
          )}
        </ClueModal>
      )}
    </>
  );
}
