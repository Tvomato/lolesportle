const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: 5432,
});

app.get('/api/players', async (req, res) => {
    let query = 
        `SELECT DISTINCT p.*, STRING_AGG(t.name, ', ') AS tournaments_played
        FROM players p
        JOIN player_tournament pt ON p.player = pt.player_name
        JOIN tournaments t ON pt.tournament_name = t.name
        WHERE t.year IN (2021, 2022, 2023, 2024)
        GROUP BY p.player, p.name, p.native_name, p.image_url, p.nationality, 
                p.birthdate, p.role, p.is_retired, p.trophies, p.worlds_appearances, 
                p.team_name, p.team_last;`
    try {
        const result = await pool.query(query);
        res.json(result.rows);
        console.log('Retrieved players data')
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/team/:name', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM teams WHERE name = '${req.params.name}'`);
        res.json(result.rows);
        console.log(`Retrieved teams data for ${req.params.name}`)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
