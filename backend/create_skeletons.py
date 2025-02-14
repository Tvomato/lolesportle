from sqlalchemy import create_engine, Column, Integer, String, Date, Boolean, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from db_config import get_db

engine = create_engine(get_db())

Base = declarative_base()

player_tournament = Table('player_tournament', Base.metadata,
    Column('player_name', String, ForeignKey('players.player')),
    Column('tournament_name', String, ForeignKey('tournaments.name'))
)

tournament_winner = Table('tournament_winner', Base.metadata,
    Column('player_name', String, ForeignKey('players.player')),
    Column('tournament_name', String, ForeignKey('tournaments.name'))
)

class Player(Base):
    __tablename__ = 'players'

    player = Column(String, primary_key=True)
    name = Column(String)
    native_name = Column(String, nullable=True)
    image_url = Column(String)
    nationality = Column(String)
    birthdate = Column(Date)
    role = Column(String)
    is_retired = Column(Boolean, default=False)
    trophies = Column(Integer, default=0)
    worlds_appearances = Column(Integer, default=0)
    team_name = Column(String, ForeignKey('teams.name'), nullable=True)
    team_last = Column(String, ForeignKey('teams.name'), nullable=True)

    team = relationship("Team", foreign_keys=[team_name], back_populates="players")
    last_team = relationship("Team", foreign_keys=[team_last])
    tournaments = relationship("Tournament", secondary=player_tournament, back_populates="players")
    tournaments_won_list = relationship("Tournament", secondary=tournament_winner, back_populates="winners")

class Team(Base):
    __tablename__ = 'teams'

    name = Column(String, primary_key=True)
    logo_url = Column(String)
    region = Column(String)

    players = relationship("Player", foreign_keys=[Player.team_name], back_populates="team")

class Tournament(Base):
    __tablename__ = 'tournaments'

    name = Column(String, primary_key=True)
    year = Column(Integer)
    region = Column(String)

    players = relationship("Player", secondary=player_tournament, back_populates="tournaments")
    winners = relationship("Player", secondary=tournament_winner, back_populates="tournaments_won_list")

Base.metadata.create_all(engine)

print(">> Tables verified")
