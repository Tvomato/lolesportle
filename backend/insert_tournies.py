import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
from create_skeletons import *
import re


def get_year(name):
    pattern = r'\b(201[3-9]|202[0-4])\b'
    match = re.search(pattern, name)
    return match.group() if match else None

engine = create_engine(get_db())
Session = sessionmaker(bind=engine)
session = Session()

with open('tournaments.json', 'r') as file:
    tournaments_data = json.load(file)

for tournament in tournaments_data:
    year = get_year(tournament.get("name"))
    new_tournament = Tournament(
        name=tournament["name"],
        region=tournament["region"],
        year=year
    )
    session.add(new_tournament)

session.commit()

session.close()

print("Tournaments inserted")
