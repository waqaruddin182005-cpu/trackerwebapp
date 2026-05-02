import axios from 'axios';

/**
 * Download file from response
 */
const downloadFile = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
};

/**
 * Export expenses as PDF
 */
export const exportExpensesAsPDF = async (user, dateRange = {}) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${user.token}` },
      responseType: 'blob'
    };

    const params = new URLSearchParams();
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);

    const response = await axios.get(`/api/export/pdf?${params.toString()}`, config);

    const filename = `expense-report-${new Date().toISOString().split('T')[0]}.pdf`;
    downloadFile(response, filename);

    return { success: true, message: 'PDF exported successfully' };
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to export PDF' };
  }
};

/**
 * Export expenses as CSV
 */
export const exportExpensesAsCSV = async (user, dateRange = {}) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${user.token}` },
      responseType: 'blob'
    };

    const params = new URLSearchParams();
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);

    const response = await axios.get(`/api/export/csv?${params.toString()}`, config);

    const filename = `expense-report-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(response, filename);

    return { success: true, message: 'CSV exported successfully' };
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to export CSV' };
  }
};

/**
 * Get export summary
 */
export const getExportSummary = async (user, dateRange = {}) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${user.token}` }
    };

    const params = new URLSearchParams();
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);

    const response = await axios.get(`/api/export/summary?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching export summary:', error);
    throw error;
  }
};
