from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
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

def get_image(name):
    image = site.client.api(
        action="query",
        format="json",
        titles=f"File:{name}",
        prop="imageinfo",
        iiprop="url",
    )

    image_info = next(iter(image["query"]["pages"].values()))["imageinfo"][0]

    return image_info["url"]

def get_player_image_file(name):
    response = site.cargo_client.query(
        limit=1,
        tables="PlayerImages=PI, Tournaments=T",
        fields="PI.FileName, PI.Link",
        join_on="PI.Tournament=T.OverviewPage",
        where='Link="%s"' % name,
        order_by="PI.SortDate DESC, T.DateStart DESC",
    )

    if not response:
        return ""

    fileName = response[0].get("FileName")
    return get_image(fileName)

with open('players.json', 'r') as file:
    players_dict = json.load(file)

count = 0
total = len(players_dict)

print(">> Inserting players and teams...")

for player_id, player_data in players_dict.items():
    if count % 25 == 0:
        print(f"{str(count)} players analyzed out of {total}")
    if p_team := player_data['Team']:
        team = session.query(Team).filter_by(name=p_team).first()
        if not team:
            res = site.cargo_client.query(
                tables="Teams=T",
                fields="T.Name, T.Region",
                where=f"""T.OverviewPage='{p_team.replace("'", "''")}'""",
                limit=1,
            )
            if not res:
                skipped_players.append(player_id)
                continue

            region = res[0].get("Region")
            if region == "Europe" or region == "EMEA":
                region = "Europe & EMEA"
            elif region == "North America" or region == "Brazil" or region == "Latin America":
                region = "Americas"

            team = Team(
                name=p_team,
                logo_url=get_image(p_team + "logo square.png"),
                region=region,
            )
            session.add(team)

    if p_team_last := player_data['TeamLast']:
        team_last = session.query(Team).filter_by(name=p_team_last).first()
        if not team_last:
            res = site.cargo_client.query(
                tables="Teams=T",
                fields="T.Name, T.Region",
                where=f"""T.OverviewPage='{p_team_last.replace("'", "''")}'""",
                limit=1,
            )
            if not res and not player_data['Team']:
                skipped_players.append(player_id)
                continue

            team = Team(
                name=p_team_last,
                logo_url=get_image(p_team_last + "logo square.png"),
                region=res[0].get("Region"),
            )
            session.add(team)

    player = Player(
        player=player_id,
        name=player_data['Name'],
        native_name=player_data['NativeName'],
        image_url=get_player_image_file(player_id),
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
    count += 1

session.commit()

print(">> Players and Teams inserted")
print(f"DEBUG: Skipped: {skipped_players} (this can be ignored)")