# extract tournament data and save to JSON

import json
from executor import exec_query

tournies = []

print(">> Extracting tournaments...")

with open("tournaments_raw.txt", "r") as file:
    for line in file:
        t_name = line.strip()
        print(t_name)
        tournies += exec_query(
            tables="Tournaments=T",
            fields="T.Name, T.DateStart, T.Date, T.League, T.Region, T.League, T.TournamentLevel, T.IsQualifier, T.IsPlayoffs, T.IsOfficial",
            where=f"T.Name = '{t_name}'",
            limit=1,
        )

with open("tournaments.json", "w") as file:
    json.dump(tournies, file, indent=4)

with open("to_insert_tournaments.json", "w") as file:
    json.dump(tournies, file, indent=4)

print(">> Finished extracting tournaments")
