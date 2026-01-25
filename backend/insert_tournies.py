"""Insert tournaments from JSON into database."""

from datetime import date
import json
import os
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
from create_skeletons import Tournament


def get_year(name):
    """Extract year from tournament name."""
    current_year = date.today().year
    last_digit = current_year % 10
    pattern = rf"\b(201[3-9]|202[0-{last_digit}])\b"
    match = re.search(pattern, name)
    return match.group() if match else None


def main():
    """Main function to insert tournaments into database."""
    if not os.path.exists("to_insert_tournaments.json"):
        print(">> No tournaments to insert")
        return 0

    with open("to_insert_tournaments.json", "r") as file:
        tournaments_data = json.load(file)

    engine = create_engine(get_db())
    Session = sessionmaker(bind=engine)
    session = Session()

    print(">> Inserting tournaments to table...")
    try:
        for tournament in tournaments_data:
            year = get_year(tournament.get("Name"))
            new_tournament = Tournament(
                name=tournament["Name"], region=tournament["Region"], year=year
            )
            session.add(new_tournament)

        session.commit()
        print(">> Tournaments inserted")
        return 0
    except Exception as e:
        session.rollback()
        print(f"!! Error inserting tournaments: {e}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    exit(main())
