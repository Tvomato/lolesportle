"""Shared utilities for fetching and creating team records."""

from typing import Optional
from sqlalchemy.orm import Session
from create_skeletons import Team
from executor import exec_query, exec_api


def get_image_url(filename: str) -> str:
    """Get image URL from filename using API. Returns empty string if not found."""
    try:
        image = exec_api(
            action="query",
            format="json",
            titles=f"File:{filename}",
            prop="imageinfo",
            iiprop="url",
        )
        image_info = next(iter(image["query"]["pages"].values()))["imageinfo"][0]
        return image_info["url"]
    except (KeyError, IndexError, StopIteration):
        return ""


def normalize_region(region: str) -> str:
    """Normalize region names to standard format."""
    if region in ("Europe", "EMEA"):
        return "Europe & EMEA"
    elif region in ("North America", "Brazil", "Latin America"):
        return "Americas"
    return region


def get_or_create_team(session: Session, team_name: Optional[str]) -> Optional[Team]:
    """Get existing team or create new one. Returns None if team not found in wiki."""
    if not team_name:
        return None

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
        return None

    region = normalize_region(res[0].get("Region"))
    team = Team(
        name=team_name,
        logo_url=get_image_url(team_name + "logo square.png"),
        region=region,
    )
    session.add(team)
    return team
