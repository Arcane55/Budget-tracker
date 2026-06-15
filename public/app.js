let allTransactions = [];
let budgetLimits = [];
let currentFilter = 'all';
let currentCategoryFilter = 'all-categories';
let currentSearch = '';
let editingId = null;

const incomeCategories = ['Salary', 'Bonus', 'Investment', 'Other'];
const expenseCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other'];

// Dark Mode
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Check for saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

const form = document.getElementById('transaction-form');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const searchInput = document.getElementById('search-input');
const exportBtn = document.getElementById('export-btn');
const filterAllBtn = document.getElementById('filter-all');
const filterIncomeBtn = document.getElementById('filter-income');
const filterExpenseBtn = document.getElementById('filter-expense');
const addLimitBtn = document.getElementById('add-limit-btn');
const limitCategorySelect = document.getElementById('limit-category');
const limitAmountInput = document.getElementById('limit-amount');

document.addEventListener('DOMContentLoaded', () => {
  loadTransactions();
  loadBudgetLimits();
  setupEventListeners();
  updateCategories();
  populateLimitCategories();
});

function setupEventListeners() {
  form.addEventListener('submit', handleFormSubmit);
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    displayTransactions();
  });
  exportBtn.addEventListener('click', exportToCSV);
  filterAllBtn.addEventListener('click', () => setFilter('all'));
  filterIncomeBtn.addEventListener('click', () => setFilter('income'));
  filterExpenseBtn.addEventListener('click', () => setFilter('expense'));
  addLimitBtn.addEventListener('click', handleAddBudgetLimit);
}

function updateCategories() {
  const type = typeSelect.value;
  const categories = type === 'income' ? incomeCategories : expenseCategories;

  categorySelect.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join('');
}

function populateLimitCategories() {
  const allCats = [...expenseCategories];
  limitCategorySelect.innerHTML = `<option value="">Select Category...</option>` +
    allCats.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function setFilter(filter) {
  currentFilter = filter;
  currentCategoryFilter = 'all-categories';
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

  if (filter === 'all') filterAllBtn.classList.add('active');
  else if (filter === 'income') filterIncomeBtn.classList.add('active');
  else if (filter === 'expense') filterExpenseBtn.classList.add('active');

  displayTransactions();
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const transaction = {
    type: typeSelect.value,
    category: categorySelect.value,
    amount: parseFloat(amountInput.value),
    description: descriptionInput.value || 'No description'
  };

  try {
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/transactions/${editingId}` : '/api/transactions';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transaction)
    });

    if (response.ok) {
      form.reset();
      editingId = null;
      document.querySelector('.btn-text').textContent = 'Add Transaction';
      updateCategories();
      loadTransactions();
    } else {
      alert('Error saving transaction');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function handleAddBudgetLimit() {
  const category = limitCategorySelect.value;
  const limitAmount = parseFloat(limitAmountInput.value);

  if (!category || !limitAmount) {
    alert('Please select category and enter limit amount');
    return;
  }

  try {
    const response = await fetch('/api/budget-limits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: category,
        limit_amount: limitAmount,
        type: 'expense'
      })
    });

    if (response.ok) {
      limitCategorySelect.value = '';
      limitAmountInput.value = '';
      loadBudgetLimits();
    } else {
      alert('Error setting budget limit');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function deleteBudgetLimit(category) {
  if (confirm('Delete this budget limit?')) {
    try {
      const response = await fetch(`/api/budget-limits/${category}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadBudgetLimits();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

async function deleteTransaction(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadTransactions();
      } else {
        alert('Error deleting transaction');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

function editTransaction(transaction) {
  editingId = transaction.id;
  typeSelect.value = transaction.type;
  updateCategories();
  categorySelect.value = transaction.category;
  amountInput.value = transaction.amount;
  descriptionInput.value = transaction.description;
  document.querySelector('.btn-text').textContent = 'Update Transaction';
  amountInput.focus();
}

async function loadTransactions() {
  try {
    const response = await fetch('/api/transactions');
    allTransactions = await response.json();
    displayTransactions();
    updateBalance();
    displayMonthlySummary();
    checkBudgetAlerts();
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
}

async function loadBudgetLimits() {
  try {
    const response = await fetch('/api/budget-limits');
    budgetLimits = await response.json();
    displayBudgetLimits();
    checkBudgetAlerts();
  } catch (error) {
    console.error('Error loading budget limits:', error);
  }
}

function getFilteredTransactions() {
  return allTransactions.filter(t => {
    const matchFilter = currentFilter === 'all' || t.type === currentFilter;
    const matchSearch = t.description.toLowerCase().includes(currentSearch.toLowerCase());
    return matchFilter && matchSearch;
  });
}

function displayTransactions() {
  const filtered = getFilteredTransactions();
  const list = document.getElementById('transactions-list');

  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty">No transactions found</p>';
    return;
  }

  list.innerHTML = filtered.map(t => `
    <div class="transaction-item ${t.type}">
      <div class="transaction-info">
        <p class="transaction-description">${t.description}</p>
        <p class="transaction-category">📂 ${t.category}</p>
        <p class="transaction-date">${new Date(t.date).toLocaleDateString()}</p>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <p class="transaction-amount">${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}</p>
        <div class="transaction-actions">
          <button class="edit-btn" onclick="editTransaction(${JSON.stringify(t).replace(/"/g, '&quot;')})">Edit</button>
          <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function displayBudgetLimits() {
  const container = document.getElementById('budget-limits-list');

  if (budgetLimits.length === 0) {
    container.innerHTML = '<p class="empty">No budget limits set</p>';
    return;
  }

  container.innerHTML = budgetLimits.map(limit => {
    const spent = calculateCategorySpent(limit.category);
    const percentage = (spent / limit.limit_amount) * 100;
    let status = 'safe';
    if (percentage >= 100) status = 'danger';
    else if (percentage >= 75) status = 'warning';

    return `
      <div class="budget-limit-item ${status}">
        <div class="budget-limit-info">
          <div class="budget-limit-category">${limit.category}</div>
          <div class="budget-limit-bar">
            <div class="budget-limit-bar-fill ${status}" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <div class="budget-limit-progress">$${spent.toFixed(2)} / $${limit.limit_amount.toFixed(2)} (${Math.round(percentage)}%)</div>
        </div>
        <button class="budget-delete-btn" onclick="deleteBudgetLimit('${limit.category}')">Remove</button>
      </div>
    `;
  }).join('');
}

function calculateCategorySpent(category) {
  return allTransactions
    .filter(t => t.type === 'expense' && t.category === category)
    .reduce((sum, t) => sum + t.amount, 0);
}

function checkBudgetAlerts() {
  const alertsContainer = document.getElementById('alerts-section');
  const alerts = [];

  budgetLimits.forEach(limit => {
    const spent = calculateCategorySpent(limit.category);
    const percentage = (spent / limit.limit_amount) * 100;

    if (percentage >= 100) {
      alerts.push({
        type: 'danger',
        icon: '❌',
        message: `Budget exceeded! ${limit.category}: $${spent.toFixed(2)} / $${limit.limit_amount.toFixed(2)}`
      });
    } else if (percentage >= 75) {
      alerts.push({
        type: 'warning',
        icon: '⚠️',
        message: `Budget warning! ${limit.category}: $${spent.toFixed(2)} / $${limit.limit_amount.toFixed(2)} (${Math.round(percentage)}%)`
      });
    }
  });

  if (alerts.length === 0) {
    alertsContainer.innerHTML = '';
    return;
  }

  alertsContainer.innerHTML = alerts.map(alert => `
    <div class="alert ${alert.type}">
      <span class="alert-icon">${alert.icon}</span>
      <span>${alert.message}</span>
    </div>
  `).join('');
}

function updateBalance() {
  let income = 0;
  let expenses = 0;

  allTransactions.forEach(t => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expenses += t.amount;
    }
  });

  const balance = income - expenses;

  document.getElementById('balance').textContent = '$' + balance.toFixed(2);
  document.getElementById('total-income').textContent = '$' + income.toFixed(2);
  document.getElementById('total-expenses').textContent = '$' + expenses.toFixed(2);
}

function displayMonthlySummary() {
  const monthlyData = {};

  allTransactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0, date: new Date(date.getFullYear(), date.getMonth(), 1) };
    }

    if (t.type === 'income') {
      monthlyData[monthKey].income += t.amount;
    } else {
      monthlyData[monthKey].expense += t.amount;
    }
  });

  const container = document.getElementById('monthly-summary');
  const sortedMonths = Object.entries(monthlyData)
    .sort((a, b) => new Date(b[1].date) - new Date(a[1].date));

  if (sortedMonths.length === 0) {
    container.innerHTML = '<p class="empty">No transactions yet</p>';
    return;
  }

  container.innerHTML = sortedMonths.map(([monthKey, data]) => {
    const balance = data.income - data.expense;
    const monthName = new Date(data.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return `
      <div class="month-card">
        <div class="month-title">📅 ${monthName}</div>
        <div class="month-stats">
          <div class="month-stat income">
            <div class="stat-label">Income</div>
            <div class="stat-value">$${data.income.toFixed(2)}</div>
          </div>
          <div class="month-stat expense">
            <div class="stat-label">Expenses</div>
            <div class="stat-value">$${data.expense.toFixed(2)}</div>
          </div>
          <div class="month-stat balance">
            <div class="stat-label">Balance</div>
            <div class="stat-value">${balance >= 0 ? '+' : ''}$${balance.toFixed(2)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function exportToCSV() {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  const rows = allTransactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.type,
    t.category,
    t.description,
    t.amount
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budget-tracker-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
