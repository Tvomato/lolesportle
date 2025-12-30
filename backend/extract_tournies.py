import json
from mwrogue.esports_client import EsportsClient
from mwrogue.auth_credentials import AuthCredentials

credentials = AuthCredentials(user_file="me")
site = EsportsClient("lol", credentials=credentials)

tournies = []

print(">> Extracting tournaments...")

with open("tournaments_raw.txt", "r") as file:
    tournaments_raw = file

for line in tournaments_raw:
    name = line.strip()
    tournies += site.cargo_client.query(
        tables="Tournaments=T",
        fields="T.Name, T.DateStart, T.Date, T.League, T.Region, T.League, T.TournamentLevel, T.IsQualifier, T.IsPlayoffs, T.IsOfficial",
        where=f"T.Name = '{name}'",
        limit=1,
    )

with open("tournaments.json", "w") as file:
    json.dump(tournies, file, indent=4)

print(">> Finished extracting tournaments")
