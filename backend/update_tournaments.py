"""Update tournaments and players from raw data."""

import json
from typing import List, Set
from executor import exec_query


def load_raw_tournaments(filename="tournaments_raw.txt") -> List[str]:
    """Load tournament names from raw text file."""
    names = []
    with open(filename, "r") as file:
        for line in file:
            line = line.strip()
            if line:
                names.append(line)
    return names


def load_existing_tournaments(filename="tournaments.json") -> Set[str]:
    """Load existing tournament names from JSON file."""
    with open(filename, "r") as file:
        data = json.load(file)

    values = set()
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                n = item.get("name")
                if isinstance(n, str):
                    values.add(n)
    return values


def query_tournament_data(t_name):
    """Query tournament data from database."""
    return exec_query(
        tables="Tournaments=T",
        fields="T.Name, T.DateStart, T.Date, T.League, T.Region, T.League, T.TournamentLevel, T.IsQualifier, T.IsPlayoffs, T.IsOfficial",
        where=f"T.Name = '{t_name}'",
        limit=1,
    )


def query_tournament_players(t_name):
    """Query players for a specific tournament."""
    return exec_query(
        tables="Tournaments=T, TournamentPlayers=TP, PlayerRedirects=PR, Players=P",
        fields="P.Player, P.Name, P.NativeName, P.Country, P.Birthdate, P.Age, P.Role, P.Team, P.TeamLast, P.IsRetired, P.FavChamps",
        where=f"(T.Name = '{str(t_name)}') AND (P.Role = 'Support' OR P.Role = 'Bot' OR P.Role = 'Mid' OR P.Role = 'Top' OR P.Role = 'Jungle')",
        join_on="T.OverviewPage=TP.OverviewPage, TP.Player=PR.AllName, PR.OverviewPage=P.OverviewPage",
        group_by="P.OverviewPage",
    )


def process_player(player_data, t_name, players_dict, new_players):
    """Process a single player's data."""
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
        new_players[player_id] = player_data
    else:
        if t_name not in players_dict[player_id]["Tournaments"]:
            players_dict[player_id]["Tournaments"].append(t_name)

    if player_data.get("FavChamps"):
        fav_champs = [champ.strip() for champ in player_data["FavChamps"].split(",")]
        players_dict[player_id]["FavChamps"] = fav_champs


def save_json(data, filename):
    """Save data to JSON file."""
    with open(filename, "w") as file:
        json.dump(data, file, indent=4)


def main():
    """Main function to update tournaments and players."""
    print(">> Updating tournaments and players...")

    try:
        raw_names = load_raw_tournaments()
        loaded_tournaments = load_existing_tournaments()
        new_tournies = []
        new_players = {}

        with open("players.json", "r") as file:
            players_dict = json.load(file)

        for t_name in raw_names:
            if t_name not in loaded_tournaments:
                new_tournies += query_tournament_data(t_name)

            res = query_tournament_players(t_name)

            for player_data in res:
                process_player(player_data, t_name, players_dict, new_players)

        save_json(players_dict, "players.json")

        if new_players:
            save_json(new_players, "to_insert_players.json")

        if new_tournies:
            save_json(new_tournies, "to_insert_tournaments.json")

            with open("tournaments.json", "r") as file:
                existing_tournies = json.load(file)
            existing_tournies.extend(new_tournies)
            save_json(existing_tournies, "tournaments.json")

        print(">> Update complete")
        return 0
    except Exception as e:
        print(f"!! Error updating tournaments: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
