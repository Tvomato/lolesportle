"""Get tournament winners and update player records in the database."""

import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_config import get_db
from create_skeletons import Player, Tournament
from executor import exec_query


def load_tournaments(filename="to_insert_tournaments.json"):
    """Load tournament data from JSON file."""
    if not os.path.exists(filename):
        return None

    with open(filename, "r") as file:
        return json.load(file)


def get_tournament_winners(query_name):
    """Query and return tournament winners."""
    return exec_query(
        tables="Tournaments=T, TournamentResults=TR, TournamentPlayers=TP",
        join_on="TR.OverviewPage=T.OverviewPage, TR.RosterPage=TP.OverviewPage, TR.Team=TP.Team",
        fields="TP.Player",
        where=f"TR.Place='1' AND T.Name = '{query_name}' AND (T.IsPlayoffs AND T.TournamentLevel='Primary' OR T.Region = 'International')",
    )


def update_player_trophies(session, tournaments_data):
    """Update player trophies and tournament wins."""
    scanned = set()

    for tournament in tournaments_data:
        t_name = tournament.get("Name")
        if not t_name:
            continue

        query_name = t_name.split(" Main Event")[0]
        if query_name in scanned:
            continue

        scanned.add(query_name)
        print(f"Now looking at winners for {query_name}")

        winners = get_tournament_winners(query_name)

        for player_data in winners:
            player_name = player_data.get("Player")
            player = session.query(Player).filter_by(player=player_name).first()
            tournament = session.query(Tournament).filter_by(name=t_name).first()

            if player and tournament:
                player.tournaments_won_list.append(tournament)
                player.trophies += 1

    session.commit()


def main():
    """Main function to process tournament winners."""
    tournaments_data = load_tournaments()

    if tournaments_data is None:
        print(">> No tournaments to insert")
        return 0

    engine = create_engine(get_db())
    Session = sessionmaker(bind=engine)
    session = Session()

    print(">> Processing tournament winners...")

    try:
        update_player_trophies(session, tournaments_data)
        os.remove("to_insert_tournaments.json")
        print(">> Tournament winners processed")
        return 0
    except Exception as e:
        session.rollback()
        print(f"!! Error processing tournament winners: {e}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    exit(main())
