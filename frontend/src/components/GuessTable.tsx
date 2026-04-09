"use client";

import { useRef, useEffect } from "react";
import { Player, Team } from "@/types";
import { getCellStyle } from "@/utils/getCellStyle";
import { getColumnMapping } from "./columns";
import FlipCell from "./FlipCell";
import AutoFit from "./AutoFit";
import styles from "@/styles/GuessTable.module.css";

interface GuessTableProps {
  currentPlayer: Player;
  guessedPlayers: Player[];
  showPlayer: boolean;
  teamMap: Map<string, Team>;
  guessRevealId: number;
}

export default function GuessTable({
  currentPlayer,
  guessedPlayers,
  showPlayer,
  teamMap,
  guessRevealId,
}: GuessTableProps) {
  const columnMapping = getColumnMapping(currentPlayer, teamMap, styles);
  const allColumns = Object.keys(columnMapping);
  const remainingColumns = allColumns.filter((col) => col !== "player");

  const prevRevealId = useRef(guessRevealId);
  const isNewGuess = guessRevealId !== prevRevealId.current;

  useEffect(() => {
    prevRevealId.current = guessRevealId;
  }, [guessRevealId]);

  const NEUTRAL_BG = "#4d4d4d"

  const renderRow = (player: Player, animate: boolean, neutral?: boolean) => {
    const playerBg = neutral
      ? NEUTRAL_BG
      : (getCellStyle("player", player, currentPlayer, teamMap)
          .backgroundColor as string);
    return (
      <>
        <div
          className={`${styles.cell} ${styles.playerSquare}`}
          style={{ backgroundColor: playerBg }}
        >
          {columnMapping["player"].render(player.player, player)}
        </div>
        {remainingColumns.map((column, colIndex) => {
          const bgColor = neutral
            ? NEUTRAL_BG
            : (getCellStyle(column, player, currentPlayer, teamMap)
                .backgroundColor as string);
          return (
            <FlipCell
              key={column}
              animate={animate}
              delayIndex={colIndex}
              bgColor={bgColor}
            >
              <AutoFit>
                {columnMapping[column].render(
                  player[column as keyof Player],
                  player
                )}
              </AutoFit>
            </FlipCell>
          );
        })}
      </>
    );
  };

  return (
    <div className={styles.gridContainer}>
      {guessedPlayers.length > 0 && (
        <div className={styles.headerRow}>
          {allColumns.map((column) => (
            <div key={column} className={styles.headerCell}>
              {columnMapping[column].header}
            </div>
          ))}
        </div>
      )}

      {showPlayer && (
        <div className={styles.guessRow}>
          {renderRow(currentPlayer, false, true)}
        </div>
      )}

      {guessedPlayers.map((player, rowIndex) => (
        <div className={styles.guessRow} key={player.player}>
          {renderRow(player, rowIndex === 0 && isNewGuess)}
        </div>
      ))}
    </div>
  );
}
