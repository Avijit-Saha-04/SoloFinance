let transactions = [];
let currentBalance = 0;

// Get current month/year for filtering
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Get category badge class
function getCategoryBadgeClass(category) {
    return `category-badge category-${category}`;
}

// Get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        food: '🍔', transport: '🚗', entertainment: '🎬',
        utilities: '⚡', salary: '💼', freelance: '💻', other: '📦'
    };
    return emojis[category] || '📦';
}

// Add transaction
function addTransaction(description, amount, type, category) {
    const transaction = {
        id: Date.now(),
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date().toISOString().split('T')[0]
    };

    transactions.unshift(transaction);
    updateDashboard();
    renderTransactions();
    
    // Reset form
    document.getElementById('transactionForm').reset();
}

// Delete transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateDashboard();
    renderTransactions();
}

// Clear all transactions
function clearAllTransactions() {
    if (transactions.length === 0) return;
    if (confirm('Are you sure you want to clear all transactions? This action cannot be undone.')) {
        transactions = [];
        updateDashboard();
        renderTransactions();
    }
}

// Update dashboard stats
function updateDashboard() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    
    // Current month transactions
    const currentMonth = getCurrentMonth();
    const monthlyTransactions = transactions.filter(t => 
        t.date.startsWith(currentMonth)
    );
    
    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const monthlyNet = monthlyIncome - monthlyExpenses;

    // Update UI
    document.getElementById('totalBalance').textContent = formatCurrency(balance);
    document.getElementById('monthlyNet').textContent = formatCurrency(monthlyNet);
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('netWorth').textContent = formatCurrency(balance);

    // Update balance change indicator
    const balanceChangeEl = document.getElementById('balanceChange');
    if (transactions.length === 0) {
        balanceChangeEl.textContent = 'Start by adding transactions';
        balanceChangeEl.style.color = 'rgba(255,255,255,0.8)';
    } else if (balance > 0) {
        balanceChangeEl.textContent = '↗️ Positive balance';
        balanceChangeEl.style.color = '#10b981';
    } else if (balance < 0) {
        balanceChangeEl.textContent = '↘️ Negative balance';
        balanceChangeEl.style.color = '#ef4444';
    } else {
        balanceChangeEl.textContent = '➡️ Breaking even';
        balanceChangeEl.style.color = 'rgba(255,255,255,0.8)';
    }

    // Update monthly change
    const monthlyChangeEl = document.getElementById('monthlyChange');
    monthlyChangeEl.textContent = `${formatCurrency(monthlyIncome)} - ${formatCurrency(monthlyExpenses)}`;

    // Update income goal progress
    updateIncomeGoalProgress(monthlyIncome);
}

// Update income goal progress
function updateIncomeGoalProgress(monthlyIncome) {
    const goalInput = document.getElementById('incomeGoal');
    const goal = parseFloat(goalInput.value) || 0;
    const progress = goal > 0 ? Math.min((monthlyIncome / goal) * 100, 100) : 0;
    
    document.getElementById('incomeProgress').style.width = `${progress}%`;
    
    const goalStatus = document.getElementById('goalStatus');
    if (goal === 0) {
        goalStatus.textContent = 'Set your monthly income goal';
    } else {
        const remaining = Math.max(0, goal - monthlyIncome);
        goalStatus.textContent = `${progress.toFixed(1)}% complete • ${formatCurrency(remaining)} remaining`;
    }
}

// Render transactions list
function renderTransactions() {
    const container = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏦</div>
                <h4 style="color: #f1f5f9; margin-bottom: 8px;">No transactions yet</h4>
                <p>Add your first transaction to start tracking your finances!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">
                    ${getCategoryEmoji(transaction.category)} ${transaction.description}
                </div>
                <div class="transaction-category">
                    <span class="${getCategoryBadgeClass(transaction.category)}">${transaction.category}</span>
                    <span style="margin-left: 12px; color: #a0aec0;">${transaction.date}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                </div>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

// Form submission
document.getElementById('transactionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const description = document.getElementById('description').value.trim();
    const amount = document.getElementById('amount').value;
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;

    if (description && amount && parseFloat(amount) > 0) {
        addTransaction(description, amount, type, category);
    }
});

// Income goal input listener
document.getElementById('incomeGoal').addEventListener('input', function() {
    const monthlyIncome = transactions
        .filter(t => t.type === 'income' && t.date.startsWith(getCurrentMonth()))
        .reduce((sum, t) => sum + t.amount, 0);
    updateIncomeGoalProgress(monthlyIncome);
});

// Initialize dashboard
updateDashboard();
renderTransactions();

// Demo data function (optional - uncomment to use)
function loadDemoData() {
    const demoTransactions = [
        { description: 'Salary Payment', amount: 3500, type: 'income', category: 'salary' },
        { description: 'Grocery Store', amount: 89.50, type: 'expense', category: 'food' },
        { description: 'Gas Station', amount: 45.00, type: 'expense', category: 'transport' },
        { description: 'Freelance Project', amount: 800, type: 'income', category: 'freelance' },
        { description: 'Netflix Subscription', amount: 15.99, type: 'expense', category: 'entertainment' }
    ];

    demoTransactions.forEach(demo => {
        addTransaction(demo.description, demo.amount, demo.type, demo.category);
    });
}

// Uncomment the line below to load demo data
// loadDemoData();