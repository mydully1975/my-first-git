require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./config/database');

const app = express();

// 기본 미들웨어
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 사용자 관련 API
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });
});

app.post('/api/users', (req, res) => {
  const { email, password, name, role } = req.body;
  const sql = 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)';
  db.run(sql, [email, password, name, role || 'user'], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, email, name, role });
  });
});

// 견적 요청 관련 API
app.get('/api/quote-requests', (req, res) => {
  db.all('SELECT * FROM quote_requests', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ quoteRequests: rows });
  });
});

app.post('/api/quote-requests', (req, res) => {
  const { customer_name, category, description, budget, deadline } = req.body;
  const sql = 'INSERT INTO quote_requests (customer_name, category, description, budget, deadline, status) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(sql, [customer_name, category, description, budget, deadline, 'pending'], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, customer_name, category, description, budget, deadline, status: 'pending' });
  });
});

// 견적서 관련 API
app.get('/api/quotes', (req, res) => {
  db.all('SELECT * FROM quotes', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ quotes: rows });
  });
});

app.post('/api/quotes', (req, res) => {
  const { quote_request_id, price, description, status } = req.body;
  const sql = 'INSERT INTO quotes (quote_request_id, price, description, status) VALUES (?, ?, ?, ?)';
  db.run(sql, [quote_request_id, price, description, status || 'pending'], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, quote_request_id, price, description, status });
  });
});

// 계약 관련 API
app.get('/api/contracts', (req, res) => {
  db.all('SELECT * FROM contracts', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ contracts: rows });
  });
});

app.post('/api/contracts', (req, res) => {
  const { quote_id, start_date, end_date, amount, status } = req.body;
  const sql = 'INSERT INTO contracts (quote_id, start_date, end_date, amount, status) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [quote_id, start_date, end_date, amount, status || 'pending'], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, quote_id, start_date, end_date, amount, status });
  });
});

// 리뷰 관련 API
app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM reviews', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ reviews: rows });
  });
});

app.post('/api/reviews', (req, res) => {
  const { contract_id, rating, comment } = req.body;
  const sql = 'INSERT INTO reviews (contract_id, rating, comment) VALUES (?, ?, ?)';
  db.run(sql, [contract_id, rating, comment], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, contract_id, rating, comment });
  });
});

// 대시보드 통계 API
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    total_quote_requests: 0,
    pending_quotes: 0,
    active_contracts: 0,
    completed_contracts: 0,
    total_revenue: 0
  };

  db.get('SELECT COUNT(*) as count FROM quote_requests', [], (err, row) => {
    if (!err && row) stats.total_quote_requests = row.count;
    
    db.get('SELECT COUNT(*) as count FROM quote_requests WHERE status = "pending"', [], (err, row) => {
      if (!err && row) stats.pending_quotes = row.count;
      
      db.get('SELECT COUNT(*) as count FROM contracts WHERE status = "active"', [], (err, row) => {
        if (!err && row) stats.active_contracts = row.count;
        
        db.get('SELECT COUNT(*) as count FROM contracts WHERE status = "completed"', [], (err, row) => {
          if (!err && row) stats.completed_contracts = row.count;
          
          db.get('SELECT SUM(amount) as total FROM contracts WHERE status = "completed"', [], (err, row) => {
            if (!err && row && row.total) stats.total_revenue = row.total;
            
            res.json(stats);
          });
        });
      });
    });
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: SQLite`);
});

module.exports = app;