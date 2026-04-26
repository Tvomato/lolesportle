"""Fetch and store team tenure history for all players."""

import json
from collections import defaultdict
from datetime import datetime, date
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from data_types import TenureQueryResult
from db_config import get_db
from create_skeletons import Player, TeamHistory
from executor import exec_query
from teams_utils import get_or_create_team


_TU_FIELDS = {
    "Team",
    "DateJoin",
    "DateLeave",
    "Duration",
    "IsCurrent",
    "RosterChangeIdJoin",
}


def _parse_date(s: Optional[str]) -> Optional[date]:
    if not s:
        return None
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        return None


def _classify_rc(row: dict) -> bool | None:
    """
    True  -- regular player RC
    False -- staff-only or Sub/Trainee RC
    None  -- no RC data
    """
    roles_ingame = (row.get("RolesIngame") or "").strip()
    roles_staff = (row.get("RolesStaff") or "").strip()
    role_mod = (row.get("RoleModifier") or "").strip()

    if not roles_ingame and not roles_staff and not role_mod:
        return None
    if not roles_ingame and roles_staff:
        return False
    if role_mod in ("Sub", "Trainee"):
        return False
    return True


def get_player_tenures(player_id: str) -> list[TenureQueryResult]:
    """Fetch active (non-staff, non-sub) team tenures for a player."""
    rows = exec_query(
        tables="TenuresUnbroken=TU, PlayerRedirects=PR, TenuresUnbroken__RosterChangeIds=TURC, RosterChanges=RC",
        join_on="TU.Player=PR.AllName, TU._ID=TURC._rowID, TURC._value=RC.RosterChangeId",
        fields=(
            "TU.Team, TU.DateJoin, TU.DateLeave, TU.Duration, TU.IsCurrent,"
            "TU.RosterChangeIdJoin,"
            "RC.RolesIngame, RC.RolesStaff, RC.RoleModifier"
        ),
        where=f"PR._pageName='{player_id.replace(chr(39), chr(39) * 2)}'",
        order_by="TU.DateJoin ASC",
    )

    # Each TU row fans out into N rows (one per associated RC). Group back by TU identity.
    seen_keys: list[str] = []
    tu_base: dict[str, dict] = {}
    tu_judgements: dict[str, list] = defaultdict(list)

    for row in rows:
        key = (
            row.get("RosterChangeIdJoin") or f'{row.get("Team")}|{row.get("DateJoin")}'
        )
        if key not in tu_base:
            seen_keys.append(key)
            tu_base[key] = {k: v for k, v in row.items() if k in _TU_FIELDS}
        tu_judgements[key].append(_classify_rc(row))

    tenures = []
    for key in seen_keys:
        judgements = tu_judgements[key]
        # No RC data at all -- include conservatively
        if all(j is None for j in judgements):
            tenures.append(tu_base[key])
        # Include if any RC in the tenure is a regular player role (catches Sub->Player)
        elif any(j is True for j in judgements):
            tenures.append(tu_base[key])

    # Backfill Duration from DateJoin/DateLeave when missing
    for tenure in tenures:
        if (
            not tenure.get("Duration")
            and tenure.get("DateJoin")
            and tenure.get("DateLeave")
        ):
            try:
                join_dt = datetime.strptime(tenure["DateJoin"], "%Y-%m-%d")
                leave_dt = datetime.strptime(tenure["DateLeave"], "%Y-%m-%d")
                tenure["Duration"] = str((leave_dt - join_dt).days)
            except ValueError:
                pass

    return tenures


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
