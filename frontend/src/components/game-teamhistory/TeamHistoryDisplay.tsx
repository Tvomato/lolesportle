"use client";

import { Team, TeamHistoryEntry } from "@/types";
import { getFullSizeImageUrl } from "@/utils/playerImage";
import styles from "@/styles/game-teamhistory/TeamHistoryDisplay.module.css";

const DEFAULT_LOGO = "/images/default_team.png";

function softHyphenate(text: string, chunkSize = 5): string {
  return text
    .split(" ")
    .map((word) =>
      word.length > chunkSize
        ? word.match(new RegExp(`.{1,${chunkSize}}`, "g"))!.join("­")
        : word
    )
    .join(" ");
}

interface TeamHistoryDisplayProps {
  teamHistory: TeamHistoryEntry[];
  teamMap: Map<string, Team>;
  showYears: boolean;
  showLastTeam: boolean;
  revealed: boolean;
}

function getLogoUrl(teamName: string, teamMap: Map<string, Team>): string {
  const logo = teamMap.get(teamName)?.logo_url;
  if (!logo) return DEFAULT_LOGO;
  return getFullSizeImageUrl(logo);
}

export default function TeamHistoryDisplay({
  teamHistory,
  teamMap,
  showYears,
  showLastTeam,
  revealed,
}: TeamHistoryDisplayProps) {
  const lastIndex = teamHistory.length - 1;

  return (
    <div className={styles.tileRow}>
      {teamHistory.map((entry, i) => {
        const isObfuscated = i === lastIndex && !showLastTeam && !revealed;
        const logoUrl = isObfuscated ? DEFAULT_LOGO : getLogoUrl(entry.team, teamMap);
        const teamName = isObfuscated ? "???" : entry.team;
        const year = entry.date_join ? entry.date_join.split("-")[0] : "?";
        const showYear = showYears || revealed;

        return (
          <div
            key={`${entry.team}-${i}`}
            className={`${styles.tile} ${isObfuscated ? styles.tileObfuscated : ""}`}
          >
            <img
              src={logoUrl}
              alt={teamName}
              className={`${styles.tileLogo} ${isObfuscated ? styles.tileLogoObfuscated : ""}`}
              draggable={false}
            />
            <span className={styles.tileName}>{softHyphenate(teamName)}</span>
            {showYear && (
              <span className={styles.tileYear}>{year}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
