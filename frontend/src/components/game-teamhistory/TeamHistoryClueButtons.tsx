"use client";

import { useState } from "react";
import { MdLock } from "react-icons/md";
import { Player } from "@/types";
import { useClueUnlocks } from "@/hooks/useClueUnlocks";
import ClueModal from "@/components/game-classic/ClueModal";
import styles from "@/styles/game-teamhistory/TeamHistoryClueButtons.module.css";

interface TeamHistoryClueButtonsProps {
  guessCount: number;
  currentPlayer: Player;
  gameOver: boolean;
  onShowYears: () => void;
  onShowLastTeam: () => void;
  onClueClose?: () => void;
}

const CLUES = [
  { label: "Clue 1: Show Join Years", threshold: 3 },
  { label: "Clue 2: Reveal Current Team", threshold: 6 },
  { label: "Clue 3: Current Role", threshold: 9 },
];

function RoleContent({ role }: { role: string }) {
  return (
    <div className={styles.roleContent}>
      <p className={styles.roleLabel}>This player&apos;s role is...</p>
      <p className={styles.roleValue}>{role}</p>
    </div>
  );
}

export default function TeamHistoryClueButtons({
  guessCount,
  currentPlayer,
  gameOver,
  onShowYears,
  onShowLastTeam,
  onClueClose,
}: TeamHistoryClueButtonsProps) {
  const { justUnlocked } = useClueUnlocks(CLUES, guessCount);
  const [clue0Used, setClue0Used] = useState(false);
  const [clue1Used, setClue1Used] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  function handleClick(i: number) {
    if (i === 0 && !clue0Used) {
      onShowYears();
      setClue0Used(true);
    } else if (i === 1 && !clue1Used) {
      onShowLastTeam();
      setClue1Used(true);
    } else if (i === 2) {
      setRoleModalOpen(true);
    }
  }

  return (
    <>
      <div className={styles.clueRow}>
        {CLUES.map((clue, i) => {
          const unlocked = gameOver || guessCount >= clue.threshold;
          const remaining = clue.threshold - guessCount;
          const glowing = justUnlocked.has(i);
          const used = (i === 0 && (clue0Used || gameOver)) || (i === 1 && (clue1Used || gameOver));

          let buttonClass = styles.clueButton;
          if (!unlocked) {
            buttonClass += ` ${styles.locked}`;
          } else if (used) {
            buttonClass += ` ${styles.used}`;
          } else if (glowing) {
            buttonClass += ` ${styles.justUnlocked}`;
          } else {
            buttonClass += ` ${styles.unlocked}`;
          }

          return (
            <button
              key={i}
              className={buttonClass}
              disabled={!unlocked || used}
              onClick={() => unlocked && !used && handleClick(i)}
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

      {roleModalOpen && (
        <ClueModal
          title={CLUES[2].label}
          onClose={() => {
            setRoleModalOpen(false);
            onClueClose?.();
          }}
        >
          <RoleContent role={currentPlayer.role} />
        </ClueModal>
      )}
    </>
  );
}
