import json
import leaguepedia_parser

tournies = []
regions = ["Korea", "China", "North America", "EMEA", "Europe", "International"]
years = list(range(2013, 2025))
valid_tournaments = ["LEC", "LCK", "LCS", "LPL", "MSI", "Worlds", "NA LCS", "EU LCS", "Champions"]
invalid_tournaments = ["Promotion", "Qualifiers", "Expansion", "Prequalifier"]

for y in years:
    for region in regions:
        tournies += leaguepedia_parser.get_tournaments(
            year=y, tournament_level="Primary", region=region
        )

full_list = [t.__dict__ for t in tournies 
             if any(t.name.startswith(v) for v in valid_tournaments) 
             and not any(iv in t.name for iv in invalid_tournaments)]

with open('tournaments.json', 'w') as file:
    json.dump(full_list, file, indent=4)

print("Retrieved tournaments")