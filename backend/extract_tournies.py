# extract tournament data and save to JSON

import json
from mwrogue.esports_client import EsportsClient
from mwrogue.auth_credentials import AuthCredentials

credentials = AuthCredentials(user_file="me")
site = EsportsClient("lol", credentials=credentials)

tournies = []

print(">> Extracting tournaments...")

cnt = 0
with open("tournaments_raw.txt", "r") as file:
    for line in file:
        t_name = line.strip()
        tournies += site.cargo_client.query(
            tables="Tournaments=T",
            fields="T.Name, T.DateStart, T.Date, T.League, T.Region, T.League, T.TournamentLevel, T.IsQualifier, T.IsPlayoffs, T.IsOfficial",
            where=f"T.Name = '{t_name}'",
            limit=1,
        )
        cnt += 1
        print(cnt)

with open("tournaments.json", "w") as file:
    json.dump(tournies, file, indent=4)

with open("to_insert_tournaments.txt", "w") as file:
    json.dump(tournies, file, indent=4)

print(">> Finished extracting tournaments")
