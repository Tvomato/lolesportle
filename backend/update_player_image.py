"""Get and update player images in the database."""

import json
from typing import Any
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from db_config import get_db
from create_skeletons import Player
from executor import exec_query, exec_api


def get_image_url_from_filename(filename: str) -> str:
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


def get_player_image(player_name: str) -> str:
    """Get the latest player image from database."""
    res = exec_query(
        tables="PlayerImages=PI, Tournaments=T",
        fields="PI.FileName, PI.Link",
        join_on="PI.Tournament=T.OverviewPage",
        where='Link="%s"' % player_name,
        order_by="T.Date DESC, PI.SortDate DESC",
        limit=1,
    )

    if not res:
        return ""

    filename = res[0].get("FileName")
    return get_image_url_from_filename(filename)


def load_players(filename: str = "players.json") -> dict[str, Any]:
    """Load player data from JSON file."""
    with open(filename, "r") as file:
        return json.load(file)


def update_player_images(session: Session, players_data: dict[str, Any]) -> None:
    """Update player images in the database."""
    for _, player_data in players_data.items():
        p_name = player_data.get("Player")
        tournaments = player_data.get("Tournaments")

        if not p_name or not tournaments:
            continue

        player = session.query(Player).filter_by(player=p_name).first()
        if player:
            image_url = get_player_image(p_name)
            if image_url and image_url != player.image_url:
                player.image_url = image_url

    session.commit()


def main() -> int:
    """Main function to update player images."""
    engine = create_engine(get_db())
    Session = sessionmaker(bind=engine)
    session = Session()

    print(">> Updating player images...")

    try:
        players_data = load_players()
        update_player_images(session, players_data)
        print(">> Player images updated")
        return 0
    except Exception as e:
        session.rollback()
        print(f"!! Error updating player images: {e}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    exit(main())
