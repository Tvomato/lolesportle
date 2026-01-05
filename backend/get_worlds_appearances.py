"""Get number of worlds appearances for each player and update database."""

import json
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
from create_skeletons import Player


def count_worlds_instances(tournies):
    """Count unique Worlds appearances for a player."""
    years = {
        entry.split()[1]
        for entry in tournies
        if "Worlds" in entry
        and len(entry.split()) > 1
        and entry.split()[1].isdigit()
        and 2013 <= int(entry.split()[1]) <= date.today().year
    }

    no_year_count = sum(
        1
        for entry in tournies
        if "Worlds" in entry
        and (len(entry.split()) == 1 or not entry.split()[1].isdigit())
    )

    return len(years) + no_year_count


def load_players(filename="players.json"):
    """Load player data from JSON file."""
    with open(filename, "r") as file:
        return json.load(file)


def update_worlds_appearances(session, players_data):
    """Update worlds appearances for each player."""
    for player_id, p_info in players_data.items():
        p_name = p_info.get("Player")
        tournaments = p_info.get("Tournaments")

        if not p_name or not tournaments:
            continue

        player = session.query(Player).filter_by(player=p_name).first()
        if player:
            player.worlds_appearances = count_worlds_instances(tournaments)

    session.commit()


def main():
    """Main function to process worlds appearances."""
    engine = create_engine(get_db())
    Session = sessionmaker(bind=engine)
    session = Session()

    print(">> Processing worlds appearances...")

    try:
        players_data = load_players()
        update_worlds_appearances(session, players_data)
        print(">> Worlds appearances processed")
        return 0
    except Exception as e:
        session.rollback()
        print(f"!! Error processing worlds appearances: {e}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    exit(main())
