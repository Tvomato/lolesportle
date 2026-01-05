"""Update player information in the database."""

import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
from create_skeletons import Player
from executor import exec_query


def load_players(filename="players.json"):
    """Load player data from JSON file."""
    with open(filename, "r") as file:
        return json.load(file)


def get_updated_player_info(player_id):
    """Query the database for updated player information."""
    return exec_query(
        tables="Players=P, PlayerRedirects=PR",
        fields="P.Player, P.Country, P.Age, P.Role, P.Team, P.TeamLast, P.IsRetired, P.FavChamps",
        where="PR.AllName='%s'" % player_id,
        join_on="PR.OverviewPage=P.OverviewPage",
        limit=1,
    )


def update_player(session, player_id, player_data, players_dict):
    """Update a single player's information."""
    res = get_updated_player_info(player_id)

    if not res:
        return

    p = res[0]
    player = session.query(Player).filter_by(player=p.get("Player", "")).first()

    if not player:
        return

    player.nationality = player_data.get("Country", "")
    player.role = player_data.get("Role", "")
    player.team = player_data.get("Team", "")
    player.team_last = player_data.get("TeamLast", "")
    player.is_retired = player_data.get("IsRetired", "0")
    player.fav_champs = player_data.get("FavChamps", [])

    cur_player_name = player_data.get("Player", "")
    if cur_player_name != player_id:
        new_player_id = p.get("Player", "")
        players_dict[new_player_id] = players_dict.pop(player_id)
    else:
        players_dict[player_id] = p


def main():
    """Main function to update player information."""
    engine = create_engine(get_db())
    Session = sessionmaker(bind=engine)
    session = Session()

    print(">> Updating player information...")

    try:
        players_dict = load_players()

        for player_id, player_data in players_dict.items():
            update_player(session, player_id, player_data, players_dict)

        session.commit()
        print(">> Player information updated")
        return 0
    except Exception as e:
        session.rollback()
        print(f"!! Error updating player information: {e}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    exit(main())
