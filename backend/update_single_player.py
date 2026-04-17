"""Update info and image for a single player (or players matching a pattern)."""

import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
from create_skeletons import Player
from update_player_info import load_players, save_players, update_player
from update_player_image import get_player_image


def find_matching_player_ids(players_dict: dict, pattern: str) -> list[str]:
    """Return player IDs that contain pattern (case-insensitive)."""
    lower = pattern.lower()
    return [pid for pid in players_dict if lower in pid.lower()]


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python update_single_player.py <player_id_pattern>")
        return 1

    pattern = sys.argv[1]
    engine = create_engine(get_db())
    SessionFactory = sessionmaker(bind=engine)
    session = SessionFactory()

    try:
        players_dict = load_players()
        matching = find_matching_player_ids(players_dict, pattern)

        if not matching:
            print(f"!! No players found matching '{pattern}'")
            return 1

        print(f">> Found {len(matching)} player(s) matching '{pattern}': {matching}")

        for player_id in matching:
            print(f">> Updating {player_id}...")
            update_player(session, player_id, players_dict)

            player = session.query(Player).filter_by(player=player_id).first()
            if player:
                image_url = get_player_image(player_id)
                if image_url and image_url != player.image_url:
                    player.image_url = image_url

        session.commit()
        save_players(players_dict)
        print(">> Done")
        return 0
    except Exception as e:
        session.rollback()
        print(f"!! Error: {e}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    exit(main())
