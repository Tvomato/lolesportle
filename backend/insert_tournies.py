# insert tournaments from JSON into database

import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
from create_skeletons import Tournament
import re
import os


def get_year(name):
    pattern = r"\b(201[3-9]|202[0-6])\b"
    match = re.search(pattern, name)
    return match.group() if match else None


if not os.path.exists("to_insert_tournaments.json"):
    print(">> No tournaments to insert")
    exit(0)

with open("to_insert_tournaments.json", "r") as file:
    tournaments_data = json.load(file)

engine = create_engine(get_db())
Session = sessionmaker(bind=engine)
session = Session()

print(">> Inserting tournaments to table...")

for tournament in tournaments_data:
    year = get_year(tournament.get("name"))
    new_tournament = Tournament(
        name=tournament["name"], region=tournament["region"], year=year
    )
    session.add(new_tournament)

session.commit()

session.close()

print(">> Tournaments inserted")
