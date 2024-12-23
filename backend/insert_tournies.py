import json
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from db_config import get_db
import re

Base = declarative_base()

class LeaguepediaTournament(Base):
    __tablename__ = 'tournaments'

    name = Column(String, primary_key=True)
    year = Column(Integer)
    region = Column(String)

def get_year(name):
    pattern = r'\b(201[3-9]|202[0-4])\b'
    match = re.search(pattern, name)
    return match.group() if match else None

engine = create_engine(get_db())
Session = sessionmaker(bind=engine)
session = Session()

with open('tournaments.json', 'r') as file:
    tournaments_data = json.load(file)

for tournament in tournaments_data:
    year = get_year(tournament.get("name"))
    new_tournament = LeaguepediaTournament(
        name=tournament["name"],
        region=tournament["region"],
        year=year
    )
    session.add(new_tournament)

session.commit()

session.close()

print("Tournaments inserted")