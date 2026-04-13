import { decode } from "html-entities";
import { PlayerRaw, Player } from "@/types";

export function calculateAge(birthdate: string): number {
  const birthDateObj = new Date(birthdate);
  const ageDiff = Date.now() - birthDateObj.getTime();
  return Math.floor(ageDiff / 31536000000);
}

export function transformData(p: PlayerRaw): Player {
  return {
    player: decode(`${p.player.split(" (")[0]} (${p.name})`),
    native_name: p.native_name,
    nationality: p.nationality,
    image_url: p.image_url,
    birthdate: p.birthdate ? calculateAge(p.birthdate) : 0,
    role: p.role,
    is_retired: p.is_retired ? "True" : "False",
    fav_champs: p.fav_champs.length > 0 ? p.fav_champs : undefined,
    trophies: p.trophies,
    tournaments_won:
      p.tournaments_won.length > 0 ? p.tournaments_won : undefined,
    worlds_appearances: p.worlds_appearances,
    team_name: p.team_name,
    team_last: p.team_last,
    tournaments_played: p.tournaments_played,
  };
}
