"""Shared TypedDict definitions for wiki API query results and intermediate data structures."""

from typing import TypedDict, Union


class TournamentQueryResult(TypedDict):
    """Raw tournament data returned from the wiki API."""

    Name: str
    DateStart: str
    Date: str
    League: str
    Region: str
    TournamentLevel: str
    IsQualifier: str
    IsPlayoffs: str
    IsOfficial: str


class PlayerQueryResult(TypedDict):
    """Raw player data returned from the wiki API."""

    Player: str
    Name: str
    NativeName: str
    Country: str
    Birthdate: str
    Age: str
    Role: str
    Team: str
    TeamLast: str
    IsRetired: str
    FavChamps: str


class PlayerData(TypedDict):
    """Processed player data stored in players.json and passed between scripts.

    Extends PlayerQueryResult with a Tournaments list. FavChamps may be a
    comma-separated string (from the raw API) or a list of strings (after
    processing in extract/update scripts).
    """

    Player: str
    Name: str
    NativeName: str
    Country: str
    Birthdate: str
    Age: str
    Role: str
    Team: str
    TeamLast: str
    IsRetired: str
    FavChamps: Union[str, list[str]]
    Tournaments: list[str]


class TeamQueryResult(TypedDict):
    """Raw team data returned from the wiki API."""

    Name: str
    Region: str


class PlayerImageQueryResult(TypedDict):
    """Raw player image data returned from the wiki API."""

    FileName: str
    Link: str


class PlayerWinnerQueryResult(TypedDict):
    """Raw tournament winner data returned from the wiki API."""

    Player: str


class UpdatedPlayerQueryResult(TypedDict):
    """Raw updated player info returned from the wiki API (used by update_player_info)."""

    Player: str
    Country: str
    Age: str
    Role: str
    Team: str
    TeamLast: str
    IsRetired: str
    FavChamps: str
