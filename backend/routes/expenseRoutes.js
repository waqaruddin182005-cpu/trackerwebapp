const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, deleteExpense, getExpenseById, updateExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getExpenses)
  .post(protect, addExpense);

router.route('/:id')
  .get(protect, getExpenseById)
  .patch(protect, updateExpense)
  .delete(protect, deleteExpense);

module.exports = router;
