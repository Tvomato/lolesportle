# get tournament winners and update player records in the database

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
import json
from create_skeletons import Player, Tournament
from executor import exec_query

engine = create_engine(get_db())
Session = sessionmaker(bind=engine)
session = Session()

if not os.path.exists("to_insert_tournaments.json"):
    print(">> No tournaments to insert")
    exit(0)

with open("to_insert_tournaments.json", "r") as file:
    tournaments_data = json.load(file)

scanned = set()

print(">> Processing tournament winners...")

for tournament in tournaments_data:
    t_name = tournament.get("Name", None)
    if not t_name:
        continue

    # Special case is necessary for World Championships
    query_name = t_name.split(" Main Event")[0]
    if query_name in scanned:
        continue
    scanned.add(query_name)

    print(f"Now looking at winners for {query_name}")

    res = exec_query(
        tables="Tournaments=T, TournamentResults=TR, TournamentPlayers=TP",
        join_on="TR.OverviewPage=T.OverviewPage, TR.RosterPage=TP.OverviewPage, TR.Team=TP.Team",
        fields="TP.Player",
        where=f"TR.Place='1' AND T.Name = '{query_name}' AND (T.IsPlayoffs AND T.TournamentLevel='Primary' OR T.Region = 'International')",
    )

    for player_data in res:
        player_name = player_data.get("Player")

        player = session.query(Player).filter_by(player=player_name).first()
        tournament = session.query(Tournament).filter_by(name=t_name).first()

        if player and tournament:
            player.tournaments_won_list.append(tournament)
            player.trophies += 1

session.commit()

os.remove("to_insert_tournaments.json")

print(">> Tournament winners processed")
