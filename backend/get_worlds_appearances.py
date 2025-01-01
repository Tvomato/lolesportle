from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
from mwrogue.esports_client import EsportsClient
import json
from create_skeletons import Player

site = EsportsClient('lol')

engine = create_engine(get_db())
Session = sessionmaker(bind=engine)
session = Session()

def count_instances(tournies):
    years = {entry.split()[1] for entry in tournies if "Worlds" in entry and len(entry.split()) > 1 and entry.split()[1].isdigit() and 2013 <= int(entry.split()[1]) <= 2024}
    no_year_count = sum(1 for entry in tournies if "Worlds" in entry and (len(entry.split()) == 1 or not entry.split()[1].isdigit()))
    return len(years) + no_year_count

with open('players.json', 'r') as file:
    players_data = json.load(file)

print(">> Processing worlds appearances...")

for player in players_data:
    p_info = players_data.get(player)
    p_name = p_info.get("Player", None)
    tournaments = p_info.get("Tournaments", None)
    if not p_name or not tournaments:
        continue

    player = session.query(Player).filter_by(player=p_name).first()
    if player:
        player.worlds_appearances = count_instances(tournaments)

    session.commit()

print(">> Worlds appearances processed")
