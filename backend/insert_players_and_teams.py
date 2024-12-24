from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from db_config import get_db
from create_skeletons import *
from mwrogue.esports_client import EsportsClient
from datetime import datetime
import json

site = EsportsClient('lol')

engine = create_engine(get_db())
Session = sessionmaker(bind=engine)
session = Session()

skipped_players = []

with open('players.json', 'r') as file:
    players_dict = json.load(file)

for player_id, player_data in players_dict.items():
    if p_team := player_data['Team']:
        team = session.query(Team).filter_by(name=p_team).first()
        if not team:
            res = site.cargo_client.query(
                tables="Teams=T",
                fields="T.Name, T.Region",
                where=f"T.Name='{p_team.replace("'", "''")}'",
                limit=1,
            )
            if not res:
                skipped_players.append(player_id)
                continue

            team = Team(
                name=p_team,
                logo_url="",
                region=res[0].get("Region"),
            )
            session.add(team)

    if p_team_last := player_data['TeamLast']:
        team_last = session.query(Team).filter_by(name=p_team_last).first()
        if not team_last:
            res = site.cargo_client.query(
                tables="Teams=T",
                fields="T.Name, T.Region",
                where=f"T.Name='{p_team_last.replace("'", "''")}'",
                limit=1,
            )
            if not res and not player_data['Team']:
                skipped_players.append(player_id)
                continue

            team = Team(
                name=p_team_last,
                logo_url="",
                region=res[0].get("Region"),
            )
            session.add(team)

    player = Player(
        player=player_id,
        name=player_data['Name'],
        native_name=player_data['NativeName'],
        image_url="",
        nationality=player_data['Country'],
        birthdate=datetime.strptime(player_data['Birthdate'], '%Y-%m-%d'),
        role=player_data['Role'],
        is_retired=bool(int(player_data['IsRetired'])),
        trophies=0,
        worlds_appearances=0,
        team_name=player_data['Team'],
        team_last=player_data['TeamLast']
    )

    for tournament_name in player_data['Tournaments']:
        tournament = session.query(Tournament).filter_by(name=tournament_name).first()
        if tournament:
            player.tournaments.append(tournament)
        else:
            print(f"Tournament not found: {tournament_name}")

    session.add(player)

session.commit()

print("Players and Teams inserted")
print("Skipped: ", skipped_players)