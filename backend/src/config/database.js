const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 데이터베이스 파일 경로
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/quote_service.db');

// 데이터베이스 디렉토리 생성
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// SQLite 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// 데이터베이스 연결 테스트
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, name TEXT, role TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

module.exports = db;