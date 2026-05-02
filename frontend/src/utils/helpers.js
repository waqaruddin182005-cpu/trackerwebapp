/**
 * Format currency to USD
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (format === 'time') {
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString();
};

/**
 * Get date range for different periods
 */
export const getDateRange = (period) => {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  let startDate;

  switch (period) {
    case 'weekly':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      startDate = weekStart.toISOString().split('T')[0];
      break;
    case 'monthly':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      break;
    case 'yearly':
      startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
    case '3months':
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      startDate = threeMonthsAgo.toISOString().split('T')[0];
      break;
    case '6months':
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      startDate = sixMonthsAgo.toISOString().split('T')[0];
      break;
    default:
      startDate = new Date(0).toISOString().split('T')[0];
  }

  return { startDate, endDate };
};

/**
 * Get month name
 */
export const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || '';
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

/**
 * Get color by category
 */
export const getCategoryColor = (category) => {
  const colors = {
    'Food': '#FF6B6B',
    'Transport': '#4ECDC4',
    'Utilities': '#45B7D1',
    'Entertainment': '#FFA07A',
    'Health': '#98D8C8',
    'Shopping': '#F7DC6F',
    'Education': '#BB8FCE',
    'Salary': '#58D68D',
    'Freelance': '#5DADE2',
    'Investment': '#F8B88B',
    'Other': '#95A5A6'
  };
  return colors[category] || '#95A5A6';
};

/**
 * Get budget status
 */
export const getBudgetStatus = (spent, limit) => {
  const percentage = (spent / limit) * 100;
  if (percentage >= 100) return { status: 'critical', label: 'Exceeded', color: 'red' };
  if (percentage >= 80) return { status: 'warning', label: 'Warning', color: 'yellow' };
  if (percentage >= 50) return { status: 'moderate', label: 'Moderate', color: 'blue' };
  return { status: 'good', label: 'Good', color: 'green' };
};

/**
 * Round number to 2 decimal places
 */
export const round = (num) => {
  return Math.round(num * 100) / 100;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Compare dates
 */
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};
