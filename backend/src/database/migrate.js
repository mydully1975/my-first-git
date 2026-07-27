const db = require('../src/config/database');

// 테이블 생성 스크립트
const createTables = () => {
  db.serialize(() => {
    // 사용자 테이블
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 견적 요청 테이블
    db.run(`CREATE TABLE IF NOT EXISTS quote_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      budget INTEGER,
      deadline DATE,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 견적서 테이블
    db.run(`CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_request_id INTEGER NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id)
    )`);

    // 계약 테이블
    db.run(`CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_id INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quote_id) REFERENCES quotes(id)
    )`);

    // 리뷰 테이블
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contract_id) REFERENCES contracts(id)
    )`);

    // 결제 테이블
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      payment_method TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contract_id) REFERENCES contracts(id)
    )`);

    // 샘플 데이터 삽입
    const sampleQuoteRequests = [
      ['김철수', 'kim@example.com', '인테리어', '사무실 인테리어 시공', 5000000, '2024-02-28', 'pending'],
      ['이영희', 'lee@example.com', '웹 개발', '쇼핑몰 웹사이트 제작', 3200000, '2024-02-15', 'approved'],
      ['박민수', 'park@example.com', '앱 개발', '배달 앱 개발', 8500000, '2024-03-15', 'completed']
    ];

    const sampleQuotes = [
      [1, 4800000, '인테리어 시공 견적', 'pending'],
      [2, 3200000, '웹사이트 제작 견적', 'approved'],
      [3, 8500000, '앱 개발 견적', 'completed']
    ];

    const sampleContracts = [
      [2, '2024-01-18', '2024-02-15', 3200000, 'completed'],
      [3, '2024-01-20', '2024-03-15', 8500000, 'active']
    ];

    const sampleReviews = [
      [1, 5, '매우 만족스럽습니다. 전문성이 뛰어나고 일정을 잘 지켰습니다.'],
      [2, 4, '전반적으로 좋았으나, 일부 디자인 수정이 필요했습니다.']
    ];

    // 샘플 데이터 삽입
    sampleQuoteRequests.forEach(data => {
      db.run('INSERT OR IGNORE INTO quote_requests (customer_name, customer_email, category, description, budget, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?)', data);
    });

    sampleQuotes.forEach(data => {
      db.run('INSERT OR IGNORE INTO quotes (quote_request_id, price, description, status) VALUES (?, ?, ?, ?)', data);
    });

    sampleContracts.forEach(data => {
      db.run('INSERT OR IGNORE INTO contracts (quote_id, start_date, end_date, amount, status) VALUES (?, ?, ?, ?, ?)', data);
    });

    sampleReviews.forEach(data => {
      db.run('INSERT OR IGNORE INTO reviews (contract_id, rating, comment) VALUES (?, ?, ?)', data);
    });

    console.log('Database tables created successfully');
    console.log('Sample data inserted successfully');
  });
};

createTables();

// 3초 후 종료
setTimeout(() => {
  db.close();
  process.exit(0);
}, 3000);