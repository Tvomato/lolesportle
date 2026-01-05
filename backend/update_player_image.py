# get number of worlds appearances for each player and update database

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
import json
from create_skeletons import Player
from executor import exec_query, exec_api

engine = create_engine(get_db())
Session = sessionmaker(bind=engine)
session = Session()


def get_image(player_name):
    res = exec_query(
        tables="PlayerImages=PI, Tournaments=T",
        fields="PI.FileName, PI.Link",
        join_on="PI.Tournament=T.OverviewPage",
        where='Link="%s"' % player_name,
        order_by="PI.SortDate DESC, T.DateStart DESC",
        limit=1,
    )

    if not res:
        return ""

    fileName = res[0].get("FileName")

    image = exec_api(
        action="query",
        format="json",
        titles=f"File:{fileName}",
        prop="imageinfo",
        iiprop="url",
    )

    image_info = next(iter(image["query"]["pages"].values()))["imageinfo"][0]

    return image_info["url"]


with open("players.json", "r") as file:
    players_data = json.load(file)

for player_id, player_data in players_data.items():
    p_name = player_data.get("Player", None)
    tournaments = player_data.get("Tournaments", None)
    if not p_name or not tournaments:
        continue

    player = session.query(Player).filter_by(player=p_name).first()

    if player:
        image_url = get_image(p_name)

        if image_url != player.image_url:
            player.image_url = image_url

session.commit()
