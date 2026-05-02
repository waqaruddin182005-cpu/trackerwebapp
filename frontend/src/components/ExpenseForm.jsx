import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseForm = ({ fetchExpenses }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const expenseCategories = ['Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Shopping', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Refunds', 'Other'];

  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      await axios.post(
        '/api/expenses',
        { title, amount: Number(amount), type, category, date: date || undefined },
        config
      );
      
      setTitle('');
      setAmount('');
      setCategory('');
      setDate('');
      fetchExpenses();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-3xl"
    >
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-blue-500" />
        Quick Add
      </h3>

      <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-6 relative">
        <button
          onClick={() => { setType('expense'); setCategory(''); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg z-10 transition-colors ${type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Expense
        </button>
        <button
          onClick={() => { setType('income'); setCategory(''); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg z-10 transition-colors ${type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Income
        </button>
        <motion.div
          layoutId="type-bg"
          className="absolute inset-y-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-lg shadow-sm"
          initial={false}
          animate={{ x: type === 'expense' ? 4 : '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Title</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2.5 rounded-xl input-glass"
            placeholder="e.g., Groceries"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-500">₹</span>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl input-glass"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Date</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 rounded-xl input-glass text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</label>
          <select
            required
            className="w-full px-4 py-2.5 rounded-xl input-glass appearance-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" disabled>Select category</option>
            {currentCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 flex items-center justify-center gap-2 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
            type === 'expense' 
              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/25 focus:ring-red-500' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25 focus:ring-emerald-500'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {type === 'expense' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              Save {type.charAt(0).toUpperCase() + type.slice(1)}
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ExpenseForm;
