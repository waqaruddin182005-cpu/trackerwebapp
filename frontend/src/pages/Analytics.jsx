import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler);

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/expenses', config);
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    if (user) fetchExpenses();
  }, [user]);

  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  // Category Pie Data
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [{
      data: Object.values(expensesByCategory),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  // Monthly Bar Data (Mocked over last 6 months for simplicity, grouping by month string)
  const monthlyData = transactions.reduce((acc, curr) => {
    const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = { income: 0, expense: 0 };
    acc[month][curr.type] += curr.amount;
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Income',
        data: Object.values(monthlyData).map(d => d.income),
        backgroundColor: '#10B981',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: Object.values(monthlyData).map(d => d.expense),
        backgroundColor: '#EF4444',
        borderRadius: 4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#64748B' } }
    },
    scales: {
      y: { grid: { color: 'rgba(100, 116, 139, 0.1)' }, ticks: { color: '#64748B' } },
      x: { grid: { display: false }, ticks: { color: '#64748B' } }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400">Deep dive into your financial health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Expense Categories</h3>
          <div className="h-[300px]">
            {expenses.length > 0 ? (
              <Pie data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#64748B' } } } }} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No expense data available</div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Cash Flow Overview</h3>
          <div className="h-[300px]">
            {transactions.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No transaction data available</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
