"""Extract tournament data and save to JSON."""

import json
from typing import Any
from executor import exec_query


def extract_tournaments(input_file: str = "tournaments_raw.txt") -> list[dict[str, Any]]:
    """Extract tournament data from input file."""
    tournies = []

    with open(input_file, "r") as file:
        for line in file:
            t_name = line.strip()
            if not t_name:
                continue

            print(f"Adding tournament: {t_name}")
            result = exec_query(
                tables="Tournaments=T",
                fields="T.Name, T.DateStart, T.Date, T.League, T.Region, T.League, T.TournamentLevel, T.IsQualifier, T.IsPlayoffs, T.IsOfficial",
                where=f"T.Name = '{t_name}'",
                limit=1,
            )
            tournies += result

    return tournies


def save_tournaments(tournies: list[dict[str, Any]], output_files: list[str]) -> None:
    """Save tournament data to JSON files."""
    for output_file in output_files:
        with open(output_file, "w") as file:
            json.dump(tournies, file, indent=4)


def main() -> int:
    """Main function to extract and save tournament data."""
    print(">> Extracting tournaments...")

    try:
        tournies = extract_tournaments()
        output_files = ["tournaments.json", "to_insert_tournaments.json"]
        save_tournaments(tournies, output_files)

        print(">> Finished extracting tournaments")
        return 0
    except Exception as e:
        print(f"!! Error extracting tournaments: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
