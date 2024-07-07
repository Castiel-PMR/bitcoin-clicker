const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Путь к базе данных
const dbPath = path.join(__dirname, 'data', 'database.db');

// Создание и подключение к базе данных SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Создание таблицы пользователей, если она не существует
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        telegramId TEXT PRIMARY KEY,
        btcCount REAL DEFAULT 0
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('User table created or already exists.');
        }
    });
});

// Маршрут для корневого URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для сохранения данных пользователя
app.post('/api/save', (req, res) => {
    const { telegramId, btcCount } = req.body;
    console.log('Received save request:', telegramId, btcCount);
    if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID is required' });
    }
    db.run(`INSERT INTO users (telegramId, btcCount) VALUES (?, ?)
            ON CONFLICT(telegramId) DO UPDATE SET btcCount = excluded.btcCount`, [telegramId, btcCount], function (err) {
        if (err) {
            console.error('Error saving user data:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'User data saved successfully' });
    });
});

// Маршрут для получения данных пользователя
app.get('/api/load/:telegramId', (req, res) => {
    const { telegramId } = req.params;
    console.log('Received load request:', telegramId);
    db.get(`SELECT btcCount FROM users WHERE telegramId = ?`, [telegramId], (err, row) => {
        if (err) {
            console.error('Error loading user data:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (row) {
            console.log('User data found:', row);
            res.json({ btcCount: row.btcCount });
        } else {
            console.log('User data not found, returning 0 BTC.');
            res.json({ btcCount: 0 });
        }
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
