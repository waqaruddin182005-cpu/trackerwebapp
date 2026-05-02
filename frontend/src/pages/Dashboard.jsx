import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { Wallet, TrendingUp, TrendingDown, Target, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, Button, LoadingSpinner } from '../components/common';
import { formatCurrency } from '../utils/helpers';
import { exportExpensesAsPDF, exportExpensesAsCSV } from '../utils/exportUtils';
import { toast } from 'react-toastify';

const SummaryCard = ({ title, amount, icon: Icon, trend, isExpense }) => {
  const isPositive = trend && !isExpense;
  const trendColor = isPositive ? 'text-green-600' : isExpense ? 'text-red-600' : 'text-slate-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{title}</p>
              <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {formatCurrency(amount)}
              </p>
              {trend && (
                <p className={`text-sm font-medium mt-2 ${trendColor}`}>
                  {isPositive ? '+' : ''}{trend}% vs last month
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${isExpense ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
              <Icon className={`h-6 w-6 ${isExpense ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchExpenses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/expenses', config);
      setTransactions(data);
    } catch (error) {
      toast.error('Error fetching transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((remainingBalance / totalIncome) * 100).toFixed(1) : 0;

  const handleExport = async (format) => {
    if (format === 'pdf') {
      const result = await exportExpensesAsPDF(user);
      if (result.success) toast.success('PDF exported');
    } else {
      const result = await exportExpensesAsCSV(user);
      if (result.success) toast.success('CSV exported');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExport('pdf')} variant="secondary" size="sm">
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button onClick={() => handleExport('csv')} variant="secondary" size="sm">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <SummaryCard title="Remaining Balance" amount={remainingBalance} icon={Wallet} />
        <SummaryCard title="Total Income" amount={totalIncome} icon={TrendingUp} trend={12} isExpense={false} />
        <SummaryCard title="Total Expenses" amount={totalExpense} icon={TrendingDown} trend={5} isExpense={true} />
        <SummaryCard title="Savings Rate" amount={Number(savingsRate)} icon={Target} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Expense Form */}
        <div className="lg:col-span-1">
          <ExpenseForm fetchExpenses={fetchExpenses} />
        </div>

        {/* Expense List */}
        <div className="lg:col-span-2">
          <ExpenseList expenses={transactions} fetchExpenses={fetchExpenses} />
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <Card>
          <CardContent>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Recent Transactions</h3>
            <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">This Month</h3>
            <p className="text-2xl font-bold text-purple-600">
              {transactions.filter(t => {
                const now = new Date();
                const tDate = new Date(t.date);
                return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Average Daily</h3>
            <p className="text-2xl font-bold text-orange-600">
              {transactions.length > 0 ? formatCurrency(totalExpense / 30) : '$0.00'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Spending</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
