const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;
const CONTENT_PATH = path.join(__dirname, 'content.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qualityfirst';

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const activeTokens = new Set();

function readContent() {
  try {
    const raw = fs.readFileSync(CONTENT_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read content file:', error);
    return {};
  }
}

function writeContent(content) {
  try {
    fs.writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2));
  } catch (error) {
    console.error('Failed to write content file:', error);
    throw error;
  }
}

app.get('/api/content', (req, res) => {
  res.json(readContent());
});

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ message: 'Пароль обязателен' });
  }
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Неверный пароль' });
  }
  const token = nanoid(32);
  activeTokens.add(token);
  res.json({ token });
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  return next();
}

app.post('/api/logout', authenticate, (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    activeTokens.delete(token);
  }
  res.json({ message: 'Вы вышли из системы' });
});

app.post('/api/content', authenticate, (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ message: 'Неверные данные' });
  }
  try {
    writeContent(payload);
    res.json({ message: 'Контент обновлен', content: payload });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при сохранении контента' });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
