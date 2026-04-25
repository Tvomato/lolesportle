"""Update player information in the database."""

import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from data_types import PlayerData, UpdatedPlayerQueryResult
from db_config import get_db
from create_skeletons import Player
from executor import exec_query
from teams_utils import get_or_create_team
from get_team_history import upsert_team_history


def load_players(filename: str = "players.json") -> dict[str, PlayerData]:
    """Load player data from JSON file."""
    with open(filename, "r") as file:
        return json.load(file)


def save_players(
    players_dict: dict[str, PlayerData], filename: str = "players.json"
) -> None:
    """Save player data to JSON file."""
    with open(filename, "w") as file:
        json.dump(players_dict, file, indent=4)


def get_updated_player_info(player_id: str) -> list[UpdatedPlayerQueryResult]:
    """Query the database for updated player information."""
    return exec_query(
        tables="Players=P, PlayerRedirects=PR",
        fields="P.Player, P.Country, P.Age, P.Role, P.Team, P.TeamLast, P.IsRetired, P.FavChamps",
        where="PR.AllName='%s'" % player_id,
        join_on="PR.OverviewPage=P.OverviewPage",
        limit=1,
    )


def update_player(
    session: Session, player_id: str, players_dict: dict[str, PlayerData]
) -> None:
    """Update a single player's information."""
    res = get_updated_player_info(player_id)

    if not res:
        return

    p = res[0]
    player = session.query(Player).filter_by(player=p.get("Player", "")).first()

    if not player:
        return

    # Create teams if they don't exist yet
    team_name = p.get("Team") or None
    team_last_name = p.get("TeamLast") or None

    if team_name:
        get_or_create_team(session, team_name)
    if team_last_name:
        get_or_create_team(session, team_last_name)

    player.nationality = p.get("Country", "")
    player.role = p.get("Role", "")
    player.team_name = team_name
    player.team_last = team_last_name
    player.is_retired = bool(int(p.get("IsRetired", "0")))

    fav_champs_str = p.get("FavChamps") or ""
    if fav_champs_str:
        fav_champs = [champ.strip() for champ in fav_champs_str.split(",")]
        player.fav_champs = fav_champs
        p["FavChamps"] = fav_champs

    cur_player_name = p.get("Player", "")
    if cur_player_name != player_id:
        players_dict[cur_player_name] = players_dict.pop(player_id)
        players_dict[cur_player_name].update(p)
    else:
        players_dict[player_id].update(p)

    upsert_team_history(session, cur_player_name or player_id)


def main() -> int:
    """Main function to update player information."""
    engine = create_engine(get_db())
    Session = sessionmaker(bind=engine)
    session = Session()

    print(">> Updating player information...")

    try:
        players_dict = load_players()

        for player_id in list(players_dict):
            update_player(session, player_id, players_dict)

        session.commit()
        save_players(players_dict)
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
