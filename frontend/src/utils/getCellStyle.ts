import clm from "country-locale-map";
import { Player, Team } from "@/types";

const COLORS = {
  blue: "#256ecd",
  green: "#14bc1a",
  orange: "#db8f13",
  red: "#981e1e",
} as const;

export function getCellStyle(
  column: string,
  player: Player,
  currentPlayer: Player,
  teamMap: Map<string, Team>
): React.CSSProperties {
  if (column === "player") {
    if (currentPlayer.player === player.player) {
      return { backgroundColor: COLORS.green };
    }
    return { backgroundColor: COLORS.blue };
  }

  const currentVal = currentPlayer[column as keyof Player];
  const playerVal = player[column as keyof Player];

  if (currentVal === playerVal && (playerVal || playerVal === 0)) {
    return { backgroundColor: COLORS.green };
  }

  if (
    column === "birthdate" &&
    Math.abs(currentPlayer.birthdate - player.birthdate) <= 2
  ) {
    return { backgroundColor: COLORS.orange };
  }

  if (column === "nationality") {
    const currentRegion = clm.getCountryByName(currentPlayer.nationality)
      ?.region;
    const playerRegion = clm.getCountryByName(player.nationality)?.region;
    if (currentRegion && currentRegion === playerRegion) {
      return { backgroundColor: COLORS.orange };
    }
  }

  if (
    column === "trophies" &&
    Math.abs(currentPlayer.trophies - player.trophies) <= 2
  ) {
    return { backgroundColor: COLORS.orange };
  }

  if (
    column === "worlds_appearances" &&
    Math.abs(
      currentPlayer.worlds_appearances - player.worlds_appearances
    ) <= 2
  ) {
    return { backgroundColor: COLORS.orange };
  }

  if (column === "tournaments_played") {
    const diff = Math.abs(
      currentPlayer.tournaments_played.length -
        player.tournaments_played.length
    );
    if (diff === 0) {
      return { backgroundColor: COLORS.green };
    } else if (diff <= 5) {
      return { backgroundColor: COLORS.orange };
    }
  }

  if (column === "team_name") {
    const currTeam = currentPlayer.team_name;
    const currTeamLast = currentPlayer.team_last;
    const playerTeam = player.team_name;
    const playerTeamLast = player.team_last;

    if (!currTeam && !playerTeam && currTeamLast === playerTeamLast) {
      return { backgroundColor: COLORS.green };
    }
    if (
      currTeam &&
      playerTeam &&
      teamMap.get(currTeam)?.region === teamMap.get(playerTeam)?.region
    ) {
      return { backgroundColor: COLORS.orange };
    }
    if (
      !currTeam &&
      !playerTeam &&
      currTeamLast &&
      playerTeamLast &&
      teamMap.get(currTeamLast)?.region ===
        teamMap.get(playerTeamLast)?.region
    ) {
      return { backgroundColor: COLORS.orange };
    }
  }

  return { backgroundColor: COLORS.red };
}
