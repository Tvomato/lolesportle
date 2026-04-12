# Lolesportle

League-of-Legends-Esports-Player-Guessing-Gamedle (or Lolesportle for short) is a guessing game centered around guessing a mystery League of Legends pro player, in a style similar to the popular web-based word game `Wordle`. The game will feature a hidden player you must guess, where each additional guess provides more hints to help you narrow down your options.

The dataset used includes any player (and subsequently their corresponding team) who has played in any major region split (NA LCS / LCS / LTA North, EU LCS / LEC, Champions / LCK, LPL) or an international tournament (First Stand, MSI, Worlds) since 2013. By default, the pool of available players for the game includes any who has played at least 3 splits or international tournaments since 2021 and is currently on a team. 

Notes:
* 2013 was chosen as the start date for this data due to it being the incorporation of the modern competitve circuit and league.
* This dataset does not include any players who are currently active in a non-player role (e.g. Players turned coaches or broadcast members).
* The `Trophies` field only counts trophies won in a major region or international tournament.
* The `Tournaments Played` field sometimes separately counts regular season and playoffs, depending on how tournaments are structured.

## Installation
Follow these steps to install and run this project locally:
1. Clone the repo
  ```sh
  git clone https://github.com/Tvomato/lolesportle.git
  ```
2. In the main `lolesportle` folder, create a `.env` file and fill in the following fields with your postgres instance
  ```sh
  DB_USER={your_db_username}
  DB_PASSWORD={your_db_password}
  DB_HOST={your_db_host}
  DB_NAME={your_db_name}
  ```
3. Install all necessary libraries and packages for the backend
  ```sh
  cd backend
  pip install -r requirements.txt
  ```
4. While in the backend, run the setup to populate all tables
  ```sh
  # This may take a few minutes to finish
  python setup_backend.py
  ```
5. Install NPM packages for the frontend
  ```sh
  cd ../frontend
  npm install
  ```
6. Start the FastAPI backend server
  ```sh
  cd ../backend
  uvicorn api:app --reload --port 8000
  ```
7. Start the Next.js frontend dev server
  ```sh
  cd ../frontend
  npm run dev
  ```

### Updating
To update the database after initial setup, use the update scripts provided in the backend directory:
  ```
  python update_tournaments.py
  python update_player_info.py
  python update_player_image.py
  ```
All 3 scripts can also be run independently, and do not need information from any area to be up to date to work.

## How to Play
From the home page, click `New Player` to generate a new mystery player to guess. Start by using the the search bar to guess an initial player. This will give you details about the mystery player.
In each column, a green background means the mystery player has the same attribute for that column, a yellow background means the attribute is similar, and a red background means the attribute is far off.

Yellow color legend:
* Nationality: The mystery player is from the same continent
* Age: The mystery player's age is within 2
* Team: The mystery player's team plays in the same region
* Trophies: The mystery player's trophy count is within 2
* Worlds Appearances: The mystery player's worlds appearances count is within 2
* Tournaments Played: The mystery player's tournament participation count is within 5

## Screenshots
**To be added**

## TODO
* Implement hints unlocked by accumulating incorrect guesses
* Add new game modes (guess player by face/silhouette)
* Allow customizing pool of players chosen in settings (the FastAPI endpoint supports `start_year`, `end_year`, `tourny_count`, and `include_retired` query params)
* Keep track of game statistics and keep progress on refresh
