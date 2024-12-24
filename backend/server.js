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

app.get('/api/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM players');
        res.json(result.rows);
        console.log('Retrieved players data')
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
