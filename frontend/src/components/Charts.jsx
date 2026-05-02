import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './common';

// Color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-600 rounded shadow-lg">
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: ${entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Line Chart - for trends over time
 */
export const TrendLineChart = ({ data, isLoading = false }) => {
  if (isLoading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-80 bg-white dark:bg-slate-800 rounded-lg p-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#718096" />
          <YAxis stroke="#718096" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981' }}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: '#EF4444' }}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="savings"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6' }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

/**
 * Area Chart - for spending trends
 */
export const SpendingAreaChart = ({ data, isLoading = false }) => {
  if (isLoading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-80 bg-white dark:bg-slate-800 rounded-lg p-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#718096" />
          <YAxis stroke="#718096" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#10B981"
            fillOpacity={1}
            fill="url(#colorIncome)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#EF4444"
            fillOpacity={1}
            fill="url(#colorExpense)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

/**
 * Bar Chart - for monthly comparison
 */
export const MonthlyBarChart = ({ data, isLoading = false }) => {
  if (isLoading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-80 bg-white dark:bg-slate-800 rounded-lg p-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#718096" />
          <YAxis stroke="#718096" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="income" fill="#10B981" isAnimationActive={true} />
          <Bar dataKey="expense" fill="#EF4444" isAnimationActive={true} />
          <Bar dataKey="net" fill="#3B82F6" isAnimationActive={true} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

/**
 * Pie Chart - for category breakdown
 */
export const CategoryPieChart = ({ data, isLoading = false }) => {
  if (isLoading) return <LoadingSpinner />;

  const chartData = data?.map((item) => ({
    name: item.category || item.name,
    value: item.amount || item.value
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-80 bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center justify-center"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={true}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

/**
 * Income vs Expense Pie Chart
 */
export const IncomeExpensePieChart = ({ income, expense, isLoading = false }) => {
  if (isLoading) return <LoadingSpinner />;

  const data = [
    { name: 'Income', value: income },
    { name: 'Expense', value: expense }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-64 bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center justify-center"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={true}
          >
            <Cell fill="#10B981" />
            <Cell fill="#EF4444" />
          </Pie>
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

/**
 * Category Bar Chart
 */
export const CategoryBarChart = ({ data, isLoading = false }) => {
  if (isLoading) return <LoadingSpinner />;

  const chartData = data?.map((item) => ({
    category: item.category || item.name,
    amount: item.amount || item.value,
    count: item.count || 0
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-80 bg-white dark:bg-slate-800 rounded-lg p-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" stroke="#718096" />
          <YAxis dataKey="category" type="category" width={100} stroke="#718096" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" fill="#3B82F6" isAnimationActive={true} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
