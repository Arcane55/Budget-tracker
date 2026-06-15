const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware - tells Express to serve static files (HTML, CSS, JS)
app.use(express.static('public'));
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('✓ Connected to SQLite database');
});

// Create transactions table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT DEFAULT 'Other',
    description TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add category column if it doesn't exist (for existing databases)
db.run(`ALTER TABLE transactions ADD COLUMN category TEXT DEFAULT 'Other'`, (err) => {
  if (err && err.message.includes('duplicate column')) {
    console.log('✓ Category column already exists');
  }
});

// Create budget limits table
db.run(`
  CREATE TABLE IF NOT EXISTS budget_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT UNIQUE NOT NULL,
    limit_amount REAL NOT NULL,
    type TEXT NOT NULL
  )
`);

// GET all transactions
app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY date DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// POST add new transaction
app.post('/api/transactions', (req, res) => {
  const { type, amount, category, description } = req.body;

  if (!type || !amount) {
    res.status(400).json({ error: 'Type and amount are required' });
    return;
  }

  db.run(
    'INSERT INTO transactions (type, amount, category, description) VALUES (?, ?, ?, ?)',
    [type, amount, category || 'Other', description],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, type, amount, category, description });
    }
  );
});

// PUT update transaction
app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { type, amount, category, description } = req.body;

  if (!type || !amount) {
    res.status(400).json({ error: 'Type and amount are required' });
    return;
  }

  db.run(
    'UPDATE transactions SET type = ?, amount = ?, category = ?, description = ? WHERE id = ?',
    [type, amount, category || 'Other', description, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// DELETE transaction
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM transactions WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// GET all budget limits
app.get('/api/budget-limits', (req, res) => {
  db.all('SELECT * FROM budget_limits', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// POST add budget limit
app.post('/api/budget-limits', (req, res) => {
  const { category, limit_amount, type } = req.body;

  if (!category || !limit_amount || !type) {
    res.status(400).json({ error: 'Category, limit_amount, and type are required' });
    return;
  }

  db.run(
    'INSERT OR REPLACE INTO budget_limits (category, limit_amount, type) VALUES (?, ?, ?)',
    [category, limit_amount, type],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, category, limit_amount, type });
    }
  );
});

// DELETE budget limit
app.delete('/api/budget-limits/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM budget_limits WHERE category = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// TEST ROUTE - Just to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✓ Budget Tracker server running on http://localhost:${PORT}`);
});
