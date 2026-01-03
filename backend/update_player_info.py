import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
from create_skeletons import *
from mwrogue.esports_client import EsportsClient
from mwrogue.esports_client import AuthCredentials

credentials = AuthCredentials(user_file="me")
site = EsportsClient("lol", credentials=credentials)

engine = create_engine(get_db())
Session = sessionmaker(bind=engine)
session = Session()


with open("players.json", "r") as file:
    players_dict = json.load(file)

for player_id, player_data in players_dict.items():
    cur_player_name = player_data.get("Player", "")
    cur_country = player_data.get("Country", "")
    cur_age = player_data.get("Age", "")
    cur_role = player_data.get("Role", "")
    cur_team = player_data.get("Team", "")
    cur_team_last = player_data.get("TeamLast", "")
    cur_retired = player_data.get("IsRetired", "0")
    cur_champs = player_data.get("FavChamps", [])

    res = site.cargo_client.query(
        tables="Players=P, PlayerRedirects=PR",
        fields="P.Player, P.Country, P.Age, P.Role, P.Team, P.TeamLast, P.IsRetired, P.FavChamps",
        where="PR.AllName='%s'" % player_id,
        join_on="PR.OverviewPage=P.OverviewPage",
        limit=1,
    )
    if res:
        p = res[0]
        player = session.query(Player).filter_by(player=p.get("Player", "")).first()
        if player:
            player.nationality = cur_country
            player.role = cur_role
            player.team = cur_team
            player.team_last = cur_team_last
            player.is_retired = cur_retired
            player.fav_champs = cur_champs

        if cur_player_name != player_id:
            new_player_id = p.get("Player", "")
            players_dict[new_player_id] = players_dict.pop(player_id)
        else:
            players_dict[player_id] = p

session.commit()
