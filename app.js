// app.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.resolve(__dirname, 'database.db');

// SQLite 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to database');
        throw err;
    }
    console.log('Connected to SQLite database');
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// 게시글 목록 조회 API
app.get('/api/posts', (req, res) => {
    const sql = 'SELECT * FROM posts';
    db.all(sql, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to fetch posts.' });
            return;
        }
        res.json(rows);
    });
});

// 게시글 작성 API
app.post('/api/posts', (req, res) => {
    const { title, detail } = req.body;
    if (!title || !detail) {
        return res.status(400).json({ error: 'Title and detail are required.' });
    }

    const sql = 'INSERT INTO posts (title, detail) VALUES (?, ?)';
    db.run(sql, [title, detail], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to save post.' });
            return;
        }
        const newPost = { id: this.lastID, title, detail };
        res.json(newPost);
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
