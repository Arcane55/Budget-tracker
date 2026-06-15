# FinTrack - Premium Budget Manager

A modern, full-stack budget tracking web application built with vanilla JavaScript, Node.js, Express, and SQLite. Manage your finances with ease using a beautiful, responsive interface.

## 🎯 Features

✨ **Transaction Management**
- Add, edit, and delete income and expense transactions
- Categorize transactions (Salary, Food, Transport, etc.)
- Add descriptions and timestamps
- Search and filter transactions by type

💡 **Budget Tracking**
- Set monthly budget limits by category
- Real-time alerts when spending reaches 75% and 100% of limit
- Visual progress bars for each category
- Track spending vs. budget

📊 **Financial Insights**
- Dashboard with total balance, income, and expenses
- Monthly summary with monthly breakdown
- Export transactions to CSV

🌙 **Modern UI/UX**
- Premium glassmorphic design
- Dark mode support (persists across sessions)
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and hover effects
- Premium color scheme with gradients

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- CSS3 (with gradients, animations, flexbox, grid)
- Vanilla JavaScript (ES6+)
- Bootstrap 5
- Font Awesome Icons

**Backend:**
- Node.js
- Express.js
- SQLite3

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/budgetracker.git
cd budgetracker
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
npm start
```

4. Open your browser and navigate to
```
http://localhost:3000
```

## 📁 Project Structure

```
budgetracker/
├── server.js                 # Express server & API endpoints
├── package.json             # Dependencies
├── .gitignore              # Git ignore rules
└── public/
    ├── index.html          # Main HTML file
    ├── app.js              # Frontend logic
    └── styles.css          # Styling
```

## 🔌 API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budget Limits
- `GET /api/budget-limits` - Get all budget limits
- `POST /api/budget-limits` - Set budget limit
- `DELETE /api/budget-limits/:id` - Delete budget limit

## 💾 Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,              -- 'income' or 'expense'
  amount REAL NOT NULL,
  category TEXT DEFAULT 'Other',
  description TEXT,
  date DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Budget Limits Table
```sql
CREATE TABLE budget_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT UNIQUE NOT NULL,
  limit_amount REAL NOT NULL,
  type TEXT NOT NULL
)
```

## 🎨 Features Breakdown

### Dashboard
- Real-time balance calculation
- Color-coded stat cards (blue for balance, green for income, red for expenses)
- Responsive grid layout

### Transaction Management
- Form with type, category, amount, and description
- Inline edit/delete buttons
- Search functionality
- Filter by income/expense/all
- Responsive table view

### Budget Limits
- Set spending limits per category
- Visual progress indicators
- Warning alerts at 75% and danger at 100%
- Easy removal of limits

### Monthly Summary
- Breakdown of monthly income and expenses
- Balance calculation per month
- Historical view of all months

## 🌙 Dark Mode

Click the moon icon in the top-right to toggle dark mode. Your preference is saved locally.

## 📱 Responsive Design

- **Desktop**: Full 2-column layout with sticky sidebar
- **Tablet**: Stacked columns with optimized spacing
- **Mobile**: Single column with touch-friendly buttons

## 🚀 Future Enhancements

- [ ] User authentication
- [ ] Cloud backup
- [ ] Budget goals with progress tracking
- [ ] Charts and analytics
- [ ] Recurring transactions
- [ ] Multiple users/families
- [ ] Mobile app (React Native)
- [ ] Notifications/reminders

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@fintrack.com or open an issue on GitHub.

---

**Made with ❤️ by FinTrack Team**
