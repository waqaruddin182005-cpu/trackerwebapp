const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');

// Get analytics data for charts
exports.getAnalyticsData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, period = 'monthly' } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Get all expenses for the user
    const expenses = await Expense.find({
      user: userId,
      ...dateFilter
    }).sort({ date: -1 });

    // Calculate summary statistics
    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpense = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalSavings = totalIncome - totalExpense;

    // Category-wise breakdown
    const categoryBreakdown = {};
    expenses.forEach(expense => {
      if (expense.type === 'expense') {
        categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
      }
    });

    // Monthly trend analysis
    const monthlyData = {};
    expenses.forEach(expense => {
      const monthKey = new Date(expense.date).toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      if (expense.type === 'income') {
        monthlyData[monthKey].income += expense.amount;
      } else {
        monthlyData[monthKey].expense += expense.amount;
      }
    });

    // Format monthly data for charts
    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        savings: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Highest spending category
    const highestCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        totalSavings,
        savingsRate: totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(2) : 0,
        highestSpendingCategory: highestCategory ? highestCategory[0] : 'N/A',
        highestSpendingAmount: highestCategory ? highestCategory[1] : 0
      },
      categoryBreakdown,
      monthlyTrend,
      expenses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics data', error: error.message });
  }
};

// Get monthly expense comparison
exports.getMonthlyComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const { months = 12 } = req.query;

    const monthsArray = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().substring(0, 7);
      monthsArray.push(monthStr);
    }

    const expenses = await Expense.find({
      user: userId,
      date: {
        $gte: new Date(monthsArray[0] + '-01'),
        $lte: new Date()
      }
    });

    const monthlyComparison = {};
    monthsArray.forEach(month => {
      monthlyComparison[month] = { income: 0, expense: 0, count: 0 };
    });

    expenses.forEach(expense => {
      const monthKey = new Date(expense.date).toISOString().substring(0, 7);
      if (monthlyComparison[monthKey]) {
        if (expense.type === 'income') {
          monthlyComparison[monthKey].income += expense.amount;
        } else {
          monthlyComparison[monthKey].expense += expense.amount;
        }
        monthlyComparison[monthKey].count += 1;
      }
    });

    const result = monthsArray.map(month => ({
      month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      monthKey: month,
      income: monthlyComparison[month].income,
      expense: monthlyComparison[month].expense,
      net: monthlyComparison[month].income - monthlyComparison[month].expense,
      count: monthlyComparison[month].count
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly comparison', error: error.message });
  }
};

// Get category-wise spending
exports.getCategoryWiseSpending = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const expenses = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    const result = expenses.map(item => ({
      category: item._id,
      amount: item.total,
      count: item.count,
      average: parseFloat(item.average.toFixed(2))
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category-wise spending', error: error.message });
  }
};

// Get spending trends
exports.getSpendingTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const expenses = await Expense.find({
      user: userId,
      type: 'expense',
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const trendData = {};
    expenses.forEach(expense => {
      const dateKey = new Date(expense.date).toISOString().split('T')[0];
      if (!trendData[dateKey]) {
        trendData[dateKey] = { total: 0, count: 0, categories: {} };
      }
      trendData[dateKey].total += expense.amount;
      trendData[dateKey].count += 1;
      trendData[dateKey].categories[expense.category] = (trendData[dateKey].categories[expense.category] || 0) + expense.amount;
    });

    const result = Object.entries(trendData).map(([date, data]) => ({
      date,
      total: data.total,
      count: data.count,
      categories: data.categories
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching spending trends', error: error.message });
  }
};

// Get income vs expense ratio
exports.getIncomeExpenseRatio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const expenses = await Expense.find({
      user: userId,
      ...dateFilter
    });

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpense = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    res.json({
      income: totalIncome,
      expense: totalExpense,
      ratio: totalIncome > 0 ? (totalExpense / totalIncome * 100).toFixed(2) : 0,
      savings: totalIncome - totalExpense,
      savingsPercentage: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching income expense ratio', error: error.message });
  }
};
