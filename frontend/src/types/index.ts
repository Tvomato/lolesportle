/** API response from GET /api/player/{id} */
export interface PlayerRaw {
  player: string;
  name: string;
  native_name: string | null;
  image_url: string;
  nationality: string;
  birthdate: string | null;
  role: string;
  is_retired: boolean;
  trophies: number;
  worlds_appearances: number;
  team_name: string | null;
  team_last: string | null;
  fav_champs: string[];
  tournaments_played: string[];
  tournaments_won: string[];
}

/** Transformed player used in game logic */
export interface Player {
  player: string;
  native_name: string | null;
  nationality: string;
  image_url: string;
  age: number;
  role: string;
  is_retired: string;
  fav_champs: string[] | undefined;
  trophies: number;
  tournaments_won: string[] | undefined;
  worlds_appearances: number;
  team_name: string | null;
  team_last: string | null;
  tournaments_played: string[];
}

/** API response from GET /api/teams */
export interface Team {
  name: string;
  logo_url: string;
  region: string;
}

/** API response item from GET /api/players/tournaments */
export interface PlayerName {
  player: string;
}

/** Column definition for the guess table */
export interface ColumnDefinition {
  header: string;
  render: (value: unknown, player: Player) => React.ReactNode;
}
