const express = require('express');
const router = express.Router();
const {
  getAnalyticsData,
  getMonthlyComparison,
  getCategoryWiseSpending,
  getSpendingTrends,
  getIncomeExpenseRatio
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAnalyticsData);
router.get('/monthly-comparison', protect, getMonthlyComparison);
router.get('/category-spending', protect, getCategoryWiseSpending);
router.get('/spending-trends', protect, getSpendingTrends);
router.get('/income-expense-ratio', protect, getIncomeExpenseRatio);

module.exports = router;
