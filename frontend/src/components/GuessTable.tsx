"use client";

import { Player, Team } from "@/types";
import { getCellStyle } from "@/utils/getCellStyle";
import { getColumnMapping } from "./columns";
import styles from "@/styles/GuessTable.module.css";

interface GuessTableProps {
  currentPlayer: Player;
  guessedPlayers: Player[];
  showPlayer: boolean;
  teamMap: Map<string, Team>;
}

export default function GuessTable({
  currentPlayer,
  guessedPlayers,
  showPlayer,
  teamMap,
}: GuessTableProps) {
  const columnMapping = getColumnMapping(currentPlayer, teamMap);
  const columns = Object.keys(columnMapping);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{columnMapping[column].header}</th>
            ))}
          </tr>
        </thead>
        {showPlayer && (
          <tbody>
            <tr>
              {columns.map((column) => (
                <td key={`current-${column}`}>
                  {columnMapping[column].render(
                    currentPlayer[column as keyof Player],
                    currentPlayer
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        )}
        <tbody>
          {guessedPlayers.map((player, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td
                  key={`${index}-${column}`}
                  style={getCellStyle(column, player, currentPlayer, teamMap)}
                >
                  {columnMapping[column].render(
                    player[column as keyof Player],
                    player
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
