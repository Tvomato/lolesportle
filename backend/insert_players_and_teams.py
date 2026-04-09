"""Insert players and teams from JSON into database."""

import os
import json
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
from create_skeletons import Player, Team, Tournament
from executor import exec_query, exec_api


def get_image_url(filename):
    """Get image URL from filename using API."""
    image = exec_api(
        action="query",
        format="json",
        titles=f"File:{filename}",
        prop="imageinfo",
        iiprop="url",
    )
    image_info = next(iter(image["query"]["pages"].values()))["imageinfo"][0]
    return image_info["url"]


def get_player_image_file(name):
    """Get the player image filename from database."""
    res = exec_query(
        tables="PlayerImages=PI, Tournaments=T",
        fields="PI.FileName, PI.Link",
        join_on="PI.Tournament=T.OverviewPage",
        where='Link="%s"' % name,
        order_by="T.Date DESC, PI.SortDate DESC",
        limit=1,
    )

    if not res:
        return ""

    filename = res[0].get("FileName")
    return get_image_url(filename)


def normalize_region(region):
    """Normalize region names to standard format."""
    if region in ("Europe", "EMEA"):
        return "Europe & EMEA"
    return region


def get_or_create_team(session, team_name, skipped_players, player_id):
    """Get existing team or create new one."""
    team = session.query(Team).filter_by(name=team_name).first()
    if team:
        normalized = normalize_region(team.region)
        if normalized != team.region:
            team.region = normalized
        return team

    res = exec_query(
        tables="Teams=T",
        fields="T.Name, T.Region",
        where=f"""T.OverviewPage='{team_name.replace("'", "''")}'""",
        limit=1,
    )

    if not res:
        skipped_players.append(player_id)
        return None

    region = normalize_region(res[0].get("Region"))
    team = Team(
        name=team_name,
        logo_url=get_image_url(team_name + "logo square.png"),
        region=region,
    )
    session.add(team)
    return team


def create_player_record(session, player_id, player_data):
    """Create a new player record."""
    return Player(
        player=player_id,
        name=player_data["Name"],
        native_name=player_data["NativeName"],
        image_url=get_player_image_file(player_id),
        nationality=player_data["Country"],
        birthdate=datetime.strptime(player_data["Birthdate"], "%Y-%m-%d"),
        role=player_data["Role"],
        is_retired=bool(int(player_data["IsRetired"])),
        trophies=0,
        worlds_appearances=0,
        team_name=player_data["Team"] or None,
        team_last=player_data["TeamLast"] or None,
    )


def add_player_tournaments(session, player, tournament_names):
    """Add tournament associations to player."""
    for tournament_name in tournament_names:
        tournament = session.query(Tournament).filter_by(name=tournament_name).first()
        if tournament:
            player.tournaments.append(tournament)
        else:
            print(f"Tournament not found: {tournament_name}")


def process_player(session, player_id, player_data, count, total, skipped_players):
    """Process a single player record."""
    if count % 25 == 0:
        print(f"{count} players analyzed out of {total}")

    # Handle current team
    if p_team := player_data["Team"]:
        team = get_or_create_team(session, p_team, skipped_players, player_id)
        if not team:
            return False

    # Handle last team
    if p_team_last := player_data["TeamLast"]:
        team_last = get_or_create_team(session, p_team_last, skipped_players, player_id)
        if not team_last and not player_data["Team"]:
            return False

    # Create player
    player = create_player_record(session, player_id, player_data)
    session.add(player)

    # Add tournament associations
    add_player_tournaments(session, player, player_data["Tournaments"])

    return True


def load_players(filename="to_insert_players.json"):
    """Load player data from JSON file."""
    if not os.path.exists(filename):
        return None

    with open(filename, "r") as file:
        return json.load(file)


def main():
    """Main function to insert players and teams into database."""
    players_dict = load_players()

    if players_dict is None:
        print(">> No players to insert")
        return 0

    engine = create_engine(get_db())
    Session = sessionmaker(bind=engine)
    session = Session()

    count = 0
    total = len(players_dict)
    skipped_players = []

    print(">> Inserting players and teams...")

    try:
        for player_id, player_data in players_dict.items():
            success = process_player(
                session, player_id, player_data, count, total, skipped_players
            )
            if success:
                count += 1

        session.commit()
        os.remove("to_insert_players.json")

        print(">> Players and Teams inserted")
        print(f"DEBUG: Skipped: {skipped_players} (this can be ignored)")
        return 0
    except Exception as e:
        session.rollback()
        print(f"!! Error inserting players and teams: {e}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    exit(main())
