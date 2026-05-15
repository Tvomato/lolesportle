import hashlib
from fastapi import FastAPI, HTTPException, Query, Depends
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, Session, selectinload
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from typing import Generator, List, Optional, Set
from datetime import date, datetime, timezone, timedelta
from db_config import get_db
from create_skeletons import Player, Team, Tournament, player_tournament, TeamHistory

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine(
    get_db(),
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency injection for database sessions
def get_db_session() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic response models for type safety and TypeScript generation
class TeamHistoryEntry(BaseModel):
    team: str
    date_join: Optional[date] = None
    date_leave: Optional[date] = None
    duration: Optional[int] = None
    is_current: bool

    model_config = ConfigDict(from_attributes=True)


class PlayerResponse(BaseModel):
    player: str
    name: str
    native_name: Optional[str] = None
    image_url: str
    nationality: str
    birthdate: Optional[date] = None
    role: str
    is_retired: bool
    trophies: int
    worlds_appearances: int
    team_name: Optional[str] = None
    team_last: Optional[str] = None
    fav_champs: List[str] = []
    tournaments_played: List[str] = []
    tournaments_won: List[str] = []
    tier1_debut: Optional[str] = None
    team_history: List[TeamHistoryEntry] = []

    model_config = ConfigDict(from_attributes=True)


class PlayerNameResponse(BaseModel):
    player: str


class TeamResponse(BaseModel):
    name: str
    logo_url: str
    region: str

    model_config = ConfigDict(from_attributes=True)


class TournamentResponse(BaseModel):
    year: int
    name: str

    model_config = ConfigDict(from_attributes=True)


# API Endpoints
@app.get(
    "/api/players",
    response_model=List[PlayerNameResponse],
    summary="Get players by tournament participation",
    description="Returns players who participated in N or more tournaments within a year range",
)
async def get_players_by_tournament_count(
    start_year: int = Query(
        date.today().year - 4, description="Start year of the tournament span", ge=2010
    ),
    end_year: int = Query(
        date.today().year, description="End year of the tournament span", le=2100
    ),
    tourny_count: int = Query(5, description="Minimum number of tournaments", ge=1),
    include_retired: bool = Query(
        False, description="Include players without a current team"
    ),
    include_current_year: bool = Query(
        True,
        description="Also include players who participated in any tournament this year",
    ),
    min_teams: int = Query(
        0,
        description="Minimum number of distinct teams in career history (0 = no filter)",
        ge=0,
    ),
    db: Session = Depends(get_db_session),
):
    """
    Get all players with N or more tournament instances in a certain span of years.
    Returns only the player column.
    """
    try:
        base_query = (
            db.query(Player.player)
            .join(player_tournament, Player.player == player_tournament.c.player_name)
            .join(Tournament, player_tournament.c.tournament_name == Tournament.name)
        )

        if not include_retired:
            base_query = base_query.filter(Player.team_name.isnot(None))

        count_query = (
            base_query.filter(
                Tournament.year >= start_year, Tournament.year <= end_year
            )
            .group_by(Player.player)
            .having(func.count(func.distinct(Tournament.name)) >= tourny_count)
        )

        player_set = {row[0] for row in count_query.all()}

        if include_current_year:
            current_year = date.today().year
            current_year_query = (
                base_query.filter(Tournament.date_start.isnot(None))
                .filter(func.extract("year", Tournament.date_start) == current_year)
                .group_by(Player.player)
            )
            for row in current_year_query.all():
                player_set.add(row[0])

        if min_teams > 0:
            qualifying = {
                row[0]
                for row in db.query(TeamHistory.player_name)
                .filter(TeamHistory.player_name.in_(player_set))
                .filter((TeamHistory.duration >= 31) | (TeamHistory.duration.is_(None)))
                .group_by(TeamHistory.player_name)
                .having(func.count(TeamHistory.id) >= min_teams)
                .all()
            }
            player_set = player_set & qualifying

        return [PlayerNameResponse(player=p) for p in player_set]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get(
    "/api/player/{player_id}",
    response_model=PlayerResponse,
    summary="Get player details",
    description="Returns all details of a specific player",
)
async def get_player_details(player_id: str, db: Session = Depends(get_db_session)):
    """
    Get all details (all columns) of a player given the player ID.
    """
    player = (
        db.query(Player)
        .options(
            selectinload(Player.tournaments),
            selectinload(Player.tournaments_won_list),
            selectinload(Player.team_history),
        )
        .filter(Player.player == player_id)
        .first()
    )

    if not player:
        raise HTTPException(status_code=404, detail=f"Player '{player_id}' not found")

    data = {c.name: getattr(player, c.name) for c in Player.__table__.columns}
    data["tournaments_played"] = [t.name for t in player.tournaments]
    data["tournaments_won"] = [t.name for t in player.tournaments_won_list]

    earliest = min(
        (t.date_start for t in player.tournaments if t.date_start is not None),
        default=None,
    )
    data["tier1_debut"] = earliest.isoformat() if earliest else None

    data["team_history"] = [
        TeamHistoryEntry.model_validate(th)
        for th in player.team_history
        if th.duration is None or th.duration >= 31
    ]

    return PlayerResponse(**data)


@app.get(
    "/api/team/{team_name}",
    response_model=TeamResponse,
    summary="Get team details",
    description="Returns all details of a specific team",
)
async def get_team_details(team_name: str, db: Session = Depends(get_db_session)):
    """
    Get all details (all columns) of a team given the team name.
    """
    team = db.query(Team).filter(Team.name == team_name).first()

    if not team:
        raise HTTPException(status_code=404, detail=f"Team '{team_name}' not found")

    return TeamResponse.model_validate(team)


@app.get(
    "/api/teams",
    response_model=List[TeamResponse],
    summary="Get all teams",
    description="Returns all teams",
)
async def get_all_teams(db: Session = Depends(get_db_session)):
    """
    Get all teams.
    """
    try:
        teams = db.query(Team).all()
        return [TeamResponse.model_validate(t) for t in teams]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get(
    "/api/tournaments",
    response_model=List[TournamentResponse],
    summary="Get all tournaments",
    description="Returns year and name for all tournaments",
)
async def get_all_tournaments(db: Session = Depends(get_db_session)):
    """
    Get all tournaments (year and name).
    """
    try:
        tournaments = db.query(Tournament).all()
        return [TournamentResponse.model_validate(t) for t in tournaments]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# --- Daily mode helpers ---

def _get_game_day() -> str:
    # Daily reset at 3 AM EST = 08:00 UTC. Subtract 8h so the date flips at that moment.
    return (datetime.now(timezone.utc) - timedelta(hours=8)).date().isoformat()


def _daily_seed(mode: str) -> int:
    key = f"{_get_game_day()}-{mode}"
    return int(hashlib.md5(key.encode()).hexdigest(), 16)


def _default_player_pool(db: Session, min_teams: int = 0) -> List[str]:
    """Return sorted player names using hardcoded default settings."""
    today = date.today()
    start_year = today.year - 4
    end_year = today.year
    tourny_count = 5

    base_query = (
        db.query(Player.player)
        .join(player_tournament, Player.player == player_tournament.c.player_name)
        .join(Tournament, player_tournament.c.tournament_name == Tournament.name)
        .filter(Player.team_name.isnot(None))
    )

    count_query = (
        base_query.filter(Tournament.year >= start_year, Tournament.year <= end_year)
        .group_by(Player.player)
        .having(func.count(func.distinct(Tournament.name)) >= tourny_count)
    )
    player_set: Set[str] = {row[0] for row in count_query.all()}

    # include_current_year=True: add all tier-1 active players from this year
    current_year_query = (
        base_query.filter(Tournament.date_start.isnot(None))
        .filter(func.extract("year", Tournament.date_start) == today.year)
        .group_by(Player.player)
    )
    for row in current_year_query.all():
        player_set.add(row[0])

    if min_teams > 0:
        qualifying = {
            row[0]
            for row in db.query(TeamHistory.player_name)
            .filter(TeamHistory.player_name.in_(player_set))
            .filter((TeamHistory.duration >= 31) | (TeamHistory.duration.is_(None)))
            .group_by(TeamHistory.player_name)
            .having(func.count(TeamHistory.id) >= min_teams)
            .all()
        }
        player_set = player_set & qualifying

    return sorted(player_set)


class DailyPlayerResponse(BaseModel):
    player: str
    game_day: str


@app.get("/api/daily/classic", response_model=DailyPlayerResponse, summary="Get today's Classic daily player")
async def get_daily_classic(db: Session = Depends(get_db_session)):
    players = _default_player_pool(db, min_teams=0)
    if not players:
        raise HTTPException(status_code=404, detail="No players available")
    seed = _daily_seed("classic")
    return DailyPlayerResponse(player=players[seed % len(players)], game_day=_get_game_day())


@app.get("/api/daily/face", response_model=DailyPlayerResponse, summary="Get today's Face daily player")
async def get_daily_face(db: Session = Depends(get_db_session)):
    players = _default_player_pool(db, min_teams=0)
    if not players:
        raise HTTPException(status_code=404, detail="No players available")
    seed = _daily_seed("face")
    return DailyPlayerResponse(player=players[seed % len(players)], game_day=_get_game_day())


@app.get("/api/daily/teamhistory", response_model=DailyPlayerResponse, summary="Get today's Team History daily player")
async def get_daily_teamhistory(db: Session = Depends(get_db_session)):
    players = _default_player_pool(db, min_teams=4)
    if not players:
        raise HTTPException(status_code=404, detail="No players available")
    seed = _daily_seed("teamhistory")
    return DailyPlayerResponse(player=players[seed % len(players)], game_day=_get_game_day())


# Health check endpoint
@app.get("/health", summary="Health check")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
