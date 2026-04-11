"""Extract player data from tournaments and save to JSON."""

import json
from typing import Any
from executor import exec_query


def load_tournaments(filename: str = "tournaments.json") -> list[dict[str, Any]]:
    """Load tournament data from JSON file."""
    with open(filename, "r") as file:
        return json.load(file)


def extract_players_from_tournament(t_name: str) -> list[dict[str, Any]]:
    """Extract players for a specific tournament."""
    return exec_query(
        tables="Tournaments=T, TournamentPlayers=TP, PlayerRedirects=PR, Players=P",
        fields="P.Player, P.Name, P.NativeName, P.Country, P.Birthdate, P.Age, P.Role, P.Team, P.TeamLast, P.IsRetired, P.FavChamps",
        where=f"(T.Name = '{str(t_name)}') AND (P.Role = 'Support' OR P.Role = 'Bot' OR P.Role = 'Mid' OR P.Role = 'Top' OR P.Role = 'Jungle')",
        join_on="T.OverviewPage=TP.OverviewPage, TP.Player=PR.AllName, PR.OverviewPage=P.OverviewPage",
        group_by="P.OverviewPage",
    )


def process_player_data(players_dict: dict[str, Any], player_data: dict[str, Any], t_name: str) -> None:
    """Process and add player data to the players dictionary."""
    if not all(
        [
            player_data.get("Birthdate"),
            player_data.get("Country"),
            player_data.get("TeamLast") != "Riot Games Inc.",
        ]
    ):
        return

    player_id = player_data["Player"]

    if player_id not in players_dict:
        player_data["Tournaments"] = [t_name]
        players_dict[player_id] = player_data
        print(f"Added new player: {player_id}")
    else:
        if t_name not in players_dict[player_id]["Tournaments"]:
            players_dict[player_id]["Tournaments"].append(t_name)

    if player_data.get("FavChamps"):
        fav_champs = [champ.strip() for champ in player_data["FavChamps"].split(",")]
        players_dict[player_id]["FavChamps"] = fav_champs


def save_players(players_dict: dict[str, Any], output_files: list[str]) -> None:
    """Save player data to JSON files."""
    for output_file in output_files:
        with open(output_file, "w") as file:
            json.dump(players_dict, file, indent=4)


def main() -> int:
    """Main function to extract and save player data."""
    print(">> Extracting players...")

    try:
        tournaments_data = load_tournaments()
        players_dict = {}

        for tournament in tournaments_data:
            t_name = tournament.get("Name")
            if not t_name:
                continue

            print(f"Now looking at players for {t_name}")
            res = extract_players_from_tournament(t_name)

            for player_data in res:
                process_player_data(players_dict, player_data, t_name)

        output_files = ["players.json", "to_insert_players.json"]
        save_players(players_dict, output_files)

        print(">> Finished extracting players")
        return 0
    except Exception as e:
        print(f"!! Error extracting players: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
