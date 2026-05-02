import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import SummaryCard from '../components/SummaryCard';
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchExpenses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/expenses', config);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((remainingBalance / totalIncome) * 100).toFixed(1) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Remaining Balance" amount={remainingBalance} icon={Wallet} />
        <SummaryCard title="Total Income" amount={totalIncome} icon={TrendingUp} trend={12} isExpense={false} />
        <SummaryCard title="Total Expenses" amount={totalExpense} icon={TrendingDown} trend={5} isExpense={true} />
        <SummaryCard title="Savings Rate" amount={Number(savingsRate)} icon={Target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpenseForm fetchExpenses={fetchExpenses} />
        </div>
        <div className="lg:col-span-2">
          <ExpenseList expenses={transactions} fetchExpenses={fetchExpenses} />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
