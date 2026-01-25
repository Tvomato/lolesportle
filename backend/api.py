from fastapi import FastAPI, HTTPException, Query, Depends
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date
from db_config import get_db
from create_skeletons import Player, Team, Tournament, player_tournament

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
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic response models for type safety and TypeScript generation
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
    "/api/players/tournaments",
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
    db: Session = Depends(get_db_session),
):
    """
    Get all players with N or more tournament instances in a certain span of years.
    Returns only the player column.
    """
    try:
        result = (
            db.query(Player.player)
            .join(player_tournament, Player.player == player_tournament.c.player_name)
            .join(Tournament, player_tournament.c.tournament_name == Tournament.name)
            .filter(Tournament.year >= start_year, Tournament.year <= end_year)
            .group_by(Player.player)
            .having(func.count(func.distinct(Tournament.name)) >= tourny_count)
            .all()
        )

        return [PlayerNameResponse(player=row[0]) for row in result]
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
    player = db.query(Player).filter(Player.player == player_id).first()

    if not player:
        raise HTTPException(status_code=404, detail=f"Player '{player_id}' not found")

    return PlayerResponse.model_validate(player)


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


# Health check endpoint
@app.get("/health", summary="Health check")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
