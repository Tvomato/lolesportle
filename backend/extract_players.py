from mwrogue.esports_client import EsportsClient
import json

site = EsportsClient('lol')

with open('tournaments.json', 'r') as file:
    tournaments_data = json.load(file)

players_dict = {}

print(">> Extracting players...")

for tournament in tournaments_data:
    t_name = tournament.get("name", None)
    if not t_name:
        continue

    print(f"Now looking at players for {t_name}")

    res = site.cargo_client.query(
        tables="Tournaments=T, TournamentPlayers=TP, PlayerRedirects=PR, Players=P",
        fields="P.Player, P.Name, P.NativeName, P.Country, P.Birthdate, P.Age, P.Role, P.Team, P.TeamLast, P.IsRetired",
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
                # Add player to the dictionary with an empty Tournaments list
                p["Tournaments"] = [t_name]
                players_dict[player_id] = p
            else:
                # Append the tournament to the Tournaments list if not already present
                if t_name not in players_dict[player_id]["Tournaments"]:
                    players_dict[player_id]["Tournaments"].append(t_name)

with open('players.json', 'w') as file:
    json.dump(players_dict, file, indent=4)

print(">> Finished extracting players")