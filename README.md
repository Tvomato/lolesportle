# Lolesportle

League-of-Legends-Esports-Player-Guessing-Gamedle (or Lolesportle for short) is a guessing game centered around guessing a mystery League of Legends pro player, in a style similar to the popular web-based word game `Wordle`. The game will feature a hidden player you must guess, where each additional guess provides more hints to help you narrow down your options.

The dataset used includes any player (and subsequently their corresponding team) who has played in any major region split (NA LCS / LCS, EU LCS / LEC, Champions / LCK, LPL) or an international tournament (MSI or Worlds) since 2013. By default, the pool of available players for the game includes any who has played at least 3 splits or international tournaments since 2021 and is currently on a team. 

Notes:
* 2013 was chosen as the start date for this data due to it being the incorporation of the modern competitve circuit and league.
* This dataset does not include any players who are currently active in a non-player role (e.g. Bengi, currently head coach of Dplus KIA).
* The `Trophies` field only counts trophies won in a major region or international tournament.
* The `Tournaments` field only includes tournaments in the years mentioned (as part of the query).

## Installation
Follow these steps to install and run this project locally:
1. Clone the repo
  ```sh
  git clone https://github.com/Tvomato/lolesportle.git
  ```
2. Install NPM packages
  ```sh
  npm install
  ```
3. In the main `lolesportle` folder, create a `.env` file and fill in the following fields with your postgres instance
  ```sh
  DB_USER={your_db_name}
  DB_PASSWORD={your_db_password}
  DB_HOST={your_db_host}
  DB_NAME={your_db_name}
  ```
4. Head into the backend and run the setup to populate the tables
  ```sh
  cd backend
  # This may take a few minutes to finish
  python setup_backend.py
  ```
5. Start the backend server
  ```sh
  cd backend
  nodemon server.js
  ```
6. Start the frontend server
  ```sh
  cd frontend
  npm start
  ```

## How to Play
From the home page, click `New Player` to generate a new mystery player to guess. Start by using the the search bar to guess an initial player. This will give you details about the mystery player.
In each column, a green background means the mystery player has the same attribute for that column, a yellow background means the attribute is similar, and a red background means the attribute is far off.

Yellow color legend:
* Nationality: The mystery player is from the same continent
* Age: The mystery player's age is within 2
* Team: The mystery player's team plays in the same region
* Trophies: The mystery player's trophy count is within 2
* Worlds appearances: The mystery player's worlds appearances count is within 2
* Tournamnets: The mystery player's tournament participation count is within 5

## Screenshots
**Home Page**
![chrome_b6qCWX7EiV](https://github.com/user-attachments/assets/83975ccb-aa5f-492f-86f4-26d7f4328258)

**Guessing a Player**
![chrome_T53k3rUW2R](https://github.com/user-attachments/assets/5bbee4dc-ccb4-4a07-9e30-bdf6de39e944)

**Game Page**
![chrome_1RR8tYkudU](https://github.com/user-attachments/assets/0e277050-dde7-4d1e-a3bc-bc8971254280)

**Revealing Player**
![chrome_4Zzu9pfiPT](https://github.com/user-attachments/assets/14201c73-ec86-48a4-8aac-cb100e65034a)

**Correct Guess**
![chrome_nmoeL8nYQV](https://github.com/user-attachments/assets/40052d07-b3b3-4357-bfe6-80dc2777af1c)

## TODO
* Create new home page
* Allow customizing pool of players chosen (for now, this can be done manually by modifying the api query in `server.js`)
* Keep track of game statistics
* Better animations for revealing cards and game victory
* (Maybe) Compress table rows to be much shorter and take up less space
