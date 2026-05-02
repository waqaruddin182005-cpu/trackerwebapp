import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Download, Filter } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  TrendLineChart,
  SpendingAreaChart,
  MonthlyBarChart,
  CategoryPieChart,
  IncomeExpensePieChart,
  CategoryBarChart
} from '../components/Charts';
import { Card, CardContent, Button, Select, LoadingSpinner } from '../components/common';
import { formatCurrency, getDateRange } from '../utils/helpers';
import { exportExpensesAsPDF, exportExpensesAsCSV } from '../utils/exportUtils';
import { toast } from 'react-toastify';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [period, setPeriod] = useState('yearly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const dateRange = period === 'custom' ? { startDate: customStart, endDate: customEnd } : getDateRange(period);

      const [analyticsRes, monthlyRes, categoryRes, trendRes] = await Promise.all([
        axios.get('/api/analytics', { ...config, params: dateRange }),
        axios.get('/api/analytics/monthly-comparison?months=12', config),
        axios.get('/api/analytics/category-spending', { ...config, params: dateRange }),
        axios.get('/api/analytics/spending-trends?days=30', config)
      ]);

      setData(analyticsRes.data);
      setMonthlyData(monthlyRes.data);
      setCategoryData(categoryRes.data);
      setTrendData(trendRes.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user, period, customStart, customEnd]);

  const handleExportPDF = async () => {
    toast.loading('Exporting to PDF...');
    const result = await exportExpensesAsPDF(user, period === 'custom' ? { startDate: customStart, endDate: customEnd } : getDateRange(period));
    if (result.success) {
      toast.dismiss();
      toast.success('PDF exported successfully');
    } else {
      toast.dismiss();
      toast.error(result.message);
    }
  };

  const handleExportCSV = async () => {
    toast.loading('Exporting to CSV...');
    const result = await exportExpensesAsCSV(user, period === 'custom' ? { startDate: customStart, endDate: customEnd } : getDateRange(period));
    if (result.success) {
      toast.dismiss();
      toast.success('CSV exported successfully');
    } else {
      toast.dismiss();
      toast.error(result.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
            <p className="text-slate-600 dark:text-slate-400">Detailed financial insights and trends</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="secondary" size="sm">
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button onClick={handleExportCSV} variant="secondary" size="sm">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-end"
      >
        <Select
          label="Period"
          options={[
            { value: 'weekly', label: 'This Week' },
            { value: 'monthly', label: 'This Month' },
            { value: '3months', label: 'Last 3 Months' },
            { value: '6months', label: 'Last 6 Months' },
            { value: 'yearly', label: 'This Year' },
            { value: 'custom', label: 'Custom' }
          ]}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full sm:w-48"
        />
        {period === 'custom' && (
          <>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </>
        )}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Total Income</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(data?.summary?.totalIncome || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(data?.summary?.totalExpense || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Total Savings</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(data?.summary?.totalSavings || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Savings Rate</p>
            <p className="text-2xl font-bold text-purple-600">{data?.summary?.savingsRate || 0}%</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent>
              <h3 className="font-semibold text-lg mb-4">Monthly Trends</h3>
              <TrendLineChart data={monthlyData} isLoading={!monthlyData} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent>
              <h3 className="font-semibold text-lg mb-4">Spending Distribution</h3>
              <CategoryPieChart data={categoryData} isLoading={!categoryData} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardContent>
              <h3 className="font-semibold text-lg mb-4">Income vs Expense</h3>
              <IncomeExpensePieChart income={data?.summary?.totalIncome || 0} expense={data?.summary?.totalExpense || 0} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardContent>
              <h3 className="font-semibold text-lg mb-4">Category Breakdown</h3>
              <CategoryBarChart data={categoryData} isLoading={!categoryData} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trend Analysis */}
      {trendData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardContent>
              <h3 className="font-semibold text-lg mb-4">30-Day Spending Trend</h3>
              <SpendingAreaChart data={trendData} isLoading={!trendData} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
