import json
from typing import List, Set

from mwrogue.esports_client import EsportsClient
from mwrogue.auth_credentials import AuthCredentials

credentials = AuthCredentials(user_file="me")
site = EsportsClient("lol", credentials=credentials)


def load_raw() -> List[str]:
    names: List[str] = []
    with open("tournaments_raw.txt", "r") as file:
        for line in file:
            line = line.strip()
            if not line:
                continue
            names.append(line)
    return names


def load_tournaments_json() -> Set[str]:
    with open("tournaments.json", "r") as file:
        data = json.load(file)

    values: Set[str] = set()
    if isinstance(data, list):
        for item in data:
            if not isinstance(item, dict):
                continue
            n = item.get("name")
            if isinstance(n, str):
                values.add(n)
    return values


raw_names = load_raw()
loaded_tournaments = load_tournaments_json()

new_tournies = []
new_players = {}

with open("players.json", "r") as file:
    players_dict = json.load(file)

for t_name in raw_names:
    if t_name not in loaded_tournaments:
        new_tournies += site.cargo_client.query(
            tables="Tournaments=T",
            fields="T.Name, T.DateStart, T.Date, T.League, T.Region, T.League, T.TournamentLevel, T.IsQualifier, T.IsPlayoffs, T.IsOfficial",
            where=f"T.Name = '{t_name}'",
            limit=1,
        )

        res = site.cargo_client.query(
            tables="Tournaments=T, TournamentPlayers=TP, PlayerRedirects=PR, Players=P",
            fields="P.Player, P.Name, P.NativeName, P.Country, P.Birthdate, P.Age, P.Role, P.Team, P.TeamLast, P.IsRetired, P.FavChamps",
            where=f"(T.Name = '{str(t_name)}') AND (P.Role = 'Support' OR P.Role = 'Bot' OR P.Role = 'Mid' OR P.Role = 'Top' OR P.Role = 'Jungle')",
            join_on="T.OverviewPage=TP.OverviewPage, TP.Player=PR.AllName, PR.OverviewPage=P.OverviewPage",
            group_by="P.OverviewPage",
        )

        for p in res:
            if (
                p.get("Birthdate") is not None
                and p.get("Country") is not None
                and p.get("TeamLast") != "Riot Games Inc."
            ):
                player_id = p["Player"]
                if player_id not in players_dict:
                    p["Tournaments"] = [t_name]
                    players_dict[player_id] = p
                    new_players[player_id] = p
                else:
                    if t_name not in players_dict[player_id]["Tournaments"]:
                        players_dict[player_id]["Tournaments"].append(t_name)

                if p.get("FavChamps"):
                    fav_champs = [champ.strip() for champ in p["FavChamps"].split(",")]
                    players_dict[player_id]["FavChamps"] = fav_champs

with open("players.json", "w") as file:
    json.dump(players_dict, file, indent=4)

if new_players:
    with open("to_insert_players.json", "w") as file:
        json.dump(new_players, file, indent=4)

if new_tournies:
    with open("to_insert_tournaments.json", "w") as file:
        json.dump(new_tournies, file, indent=4)

    with open("tournaments.json", "r") as file:
        existing_new_tournies = json.load(file)

    existing_new_tournies.extend(new_tournies)
    with open("tournaments.json", "w") as file:
        json.dump(existing_new_tournies, file, indent=4)
