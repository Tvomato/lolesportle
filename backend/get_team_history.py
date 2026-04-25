"""Fetch and store team tenure history for all players."""

import json
from datetime import datetime, date
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from data_types import TenureQueryResult
from db_config import get_db
from create_skeletons import Player, TeamHistory
from executor import exec_query
from teams_utils import get_or_create_team


def _parse_date(s: Optional[str]) -> Optional[date]:
    if not s:
        return None
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        return None


def get_player_tenures(player_id: str) -> list[TenureQueryResult]:
    """Fetch all team tenures for a player, resolving historical name changes."""
    return exec_query(
        tables="TenuresUnbroken=TU, PlayerRedirects=PR",
        join_on="TU.Player=PR.AllName",
        fields="TU.Team, TU.DateJoin, TU.DateLeave, TU.Duration, TU.IsCurrent",
        where=f"PR._pageName='{player_id.replace(chr(39), chr(39) * 2)}'",
        order_by="TU.DateJoin ASC",
    )


def upsert_team_history(session: Session, player_id: str) -> None:
    """Replace team history rows for a player and ensure all teams exist in Teams table."""
    if not session.query(Player).filter_by(player=player_id).first():
        return

    tenures = get_player_tenures(player_id)

    session.query(TeamHistory).filter_by(player_name=player_id).delete()

    for t in tenures:
        team_name = t.get("Team") or ""
        if team_name:
            get_or_create_team(session, team_name)

        dur = t.get("Duration")
        session.add(
            TeamHistory(
                player_name=player_id,
                team=team_name,
                date_join=_parse_date(t.get("DateJoin")),
                date_leave=_parse_date(t.get("DateLeave")),
                duration=int(dur) if dur else None,
                is_current=bool(int(t.get("IsCurrent") or "0")),
            )
        )


def main() -> int:
    """Populate team_history for all players in players.json. Safe to re-run (upserts)."""
    with open("players.json", "r") as f:
        players: dict = json.load(f)

    engine = create_engine(get_db())
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    print(">> Fetching team history for all players...")

    try:
        player_ids = list(players.keys())
        for i, player_id in enumerate(player_ids):
            upsert_team_history(session, player_id)
            if (i + 1) % 25 == 0:
                print(f"  Processed {i + 1}/{len(player_ids)} players")

        session.commit()
        print(f">> Team history populated for {len(player_ids)} players")
        return 0
    except Exception as e:
        session.rollback()
        print(f"!! Error populating team history: {e}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    exit(main())
