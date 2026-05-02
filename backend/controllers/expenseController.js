const Expense = require('../models/Expense');
const { checkBudgetAlerts, createNotification } = require('./notificationController');

exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, type } = req.query;
    let query = { user: req.user._id };

    // Apply filters
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching expenses', error: error.message });
  }
};

exports.addExpense = async (req, res) => {
  const { title, amount, type, category, date, description } = req.body;

  // Validation
  if (!title || !amount || !category) {
    return res.status(400).json({ message: 'Title, amount, and category are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than 0' });
  }

  try {
    const expense = new Expense({
      user: req.user._id,
      title,
      amount,
      type: type || 'expense',
      category,
      date: date || Date.now(),
      description
    });

    const createdExpense = await expense.save();

    // Create success notification
    await createNotification(
      req.user._id,
      'success',
      'Expense Added',
      `${title} of $${amount.toFixed(2)} added to ${category}`
    );

    // Check budget alerts if it's an expense
    if (type !== 'income') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const monthlySpending = await Expense.aggregate([
        {
          $match: {
            user: require('mongoose').Types.ObjectId(req.user._id),
            type: 'expense',
            category: category,
            date: { $gte: monthStart, $lte: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const currentMonthSpending = monthlySpending.length > 0 ? monthlySpending[0].total : 0;
      await checkBudgetAlerts(req.user._id, category, currentMonthSpending);
    }

    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding expense', error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const expenseData = { ...expense.toObject() };
    await expense.deleteOne();

    // Create notification
    await createNotification(
      req.user._id,
      'info',
      'Expense Deleted',
      `${expenseData.title} has been deleted`
    );

    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting expense', error: error.message });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching expense', error: error.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    expense.title = title || expense.title;
    expense.amount = amount || expense.amount;
    expense.type = type || expense.type;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.description = description !== undefined ? description : expense.description;

    const updatedExpense = await expense.save();

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating expense', error: error.message });
  }
};
