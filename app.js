require('dotenv').config(); // .env 파일의 환경 변수를 로드합니다
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'database.db');


// 데이터베이스 초기화 및 스키마 수정
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
        process.exit(1); // 연결 실패 시 프로세스 종료
    }
    console.log('Connected to SQLite database');
    
    // 테이블 스키마를 초기화하거나 수정합니다.
    db.serialize(() => {
        db.run("PRAGMA foreign_keys=OFF");
        db.run("ALTER TABLE posts RENAME TO old_posts");
        db.run("CREATE TABLE posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, detail TEXT NOT NULL, content TEXT)");
        db.run("INSERT INTO posts (id, title, detail, content) SELECT id, title, detail, content FROM old_posts");
        db.run("DROP TABLE old_posts");
    }, (err) => {
        if (err) {
            console.error('Failed to initialize or migrate database:', err.message);
        } else {
            console.log('Database schema initialized/migrated successfully');
        }
    });
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// 게시글 목록 조회 API
app.get('/api/posts', (req, res) => {
    const sql = 'SELECT * FROM posts';
    db.all(sql, (err, rows) => {
        if (err) {
            console.error('Failed to fetch posts:', err.message);
            return res.status(500).json({ error: 'Failed to fetch posts.' });
        }
        res.json(rows);
    });
});

// 게시글 작성 API
app.post('/api/posts', (req, res) => {
    const { title, detail, content } = req.body;

    // 입력 값이 유효한지 확인
    if (!title || !detail || !content) {
        return res.status(400).json({ error: 'Title, detail, and content are required.' });
    }

    const sql = 'INSERT INTO posts (title, detail, content) VALUES (?, ?, ?)';
    db.run(sql, [title.trim(), detail.trim(), content.trim()], function(err) {
        if (err) {
            console.error('Failed to save post:', err.message);
            return res.status(500).json({ error: 'Failed to save post.' });
        }
        const newPost = { id: this.lastID, title, detail, content };
        res.status(201).json(newPost);
    });
});


// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
