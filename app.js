// app.js

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataFilePath = path.join(__dirname, 'data', 'posts.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// 게시글 목록 API
app.get('/api/posts', async (req, res) => {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        const posts = JSON.parse(data);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch posts.' });
    }
});

// 게시글 작성 API
app.post('/api/posts', async (req, res) => {
    const { title, detail } = req.body;
    if (!title || !detail) {
        return res.status(400).json({ error: 'Title and detail are required.' });
    }

    try {
        let data = await fs.readFile(dataFilePath, 'utf8');
        let posts = JSON.parse(data);
        const newPost = { id: Date.now(), title, detail };
        posts.push(newPost);
        await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2));
        res.json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save post.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
