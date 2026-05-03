const jsPDF = require('jspdf');
require('jspdf-autotable');
const Papa = require('papaparse');
const Expense = require('../models/Expense');
const User = require('../models/User');

// Export expenses as PDF
exports.exportPDF = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const user = await User.findById(userId);
    const expenses = await Expense.find({
      user: userId,
      ...(startDate && endDate && {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
    }).sort({ date: -1 });

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;

    // Header
    doc.setFontSize(20);
    doc.text('Expense Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`User: ${user.name}`, 15, yPosition);
    yPosition += 5;
    doc.text(`Email: ${user.email}`, 15, yPosition);
    yPosition += 5;
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 15, yPosition);

    // Summary
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const totalSavings = totalIncome - totalExpense;

    yPosition += 12;
    doc.setDrawColor(200);
    doc.rect(15, yPosition, pageWidth - 30, 30);

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Total Income: ₹${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, yPosition + 8);
    doc.text(`Total Expenses: ₹${totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, yPosition + 16);
    doc.text(`Net Savings: ₹${totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, yPosition + 24);

    yPosition += 40;

    // Prepare table data
    const tableData = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString('en-IN'),
      expense.category,
      expense.type === 'income' ? 'Income' : 'Expense',
      `₹${expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      expense.description || '-'
    ]);

    // Add table
    doc.autoTable({
      head: [['Date', 'Category', 'Type', 'Amount', 'Description']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: { top: 10 },
    });

    // Charts summary (text-based)
    const lastY = doc.lastAutoTable.finalY + 20;
    if (lastY < doc.internal.pageSize.getHeight() - 50) {
      doc.setFontSize(12);
      doc.text('Charts Summary:', 15, lastY);

      const categories = {};
      expenses.forEach(exp => {
        if (exp.type === 'expense') {
          categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
        }
      });

      const topCategories = Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      doc.setFontSize(10);
      topCategories.forEach(([cat, amt], idx) => {
        doc.text(`${cat}: ₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, lastY + 10 + (idx * 5));
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      );
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="expense-report-${new Date().toISOString().split('T')[0]}.pdf"`);

    // Send PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting PDF', error: error.message });
  }
};

// Export expenses as CSV
exports.exportCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const expenses = await Expense.find({
      user: userId,
      ...(startDate && endDate && {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
    }).sort({ date: -1 });

    // Transform data for CSV
    const csvData = expenses.map(expense => ({
      Date: new Date(expense.date).toISOString().split('T')[0],
      Category: expense.category,
      Type: expense.type === 'income' ? 'Income' : 'Expense',
      Amount: expense.amount.toFixed(2),
      Description: expense.description || '',
      Notes: ''
    }));

    // Generate CSV string
    const csv = Papa.unparse(csvData);

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="expense-report-${new Date().toISOString().split('T')[0]}.csv"`);

    // Send CSV
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting CSV', error: error.message });
  }
};

// Get printable expense summary
exports.getExportSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const user = await User.findById(userId);
    const expenses = await Expense.find({
      user: userId,
      ...(startDate && endDate && {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
    }).sort({ date: -1 });

    const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const totalSavings = totalIncome - totalExpense;

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(expense => {
      if (expense.type === 'expense') {
        categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
      }
    });

    res.json({
      userName: user.name,
      userEmail: user.email,
      generatedDate: new Date().toISOString(),
      periodStart: startDate || 'All Time',
      periodEnd: endDate || 'Present',
      summary: {
        totalIncome,
        totalExpense,
        totalSavings,
        savingsRate: totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(2) : 0
      },
      categoryBreakdown,
      expenseCount: expenses.length,
      incomeCount: expenses.filter(e => e.type === 'income').length,
      expenseCount: expenses.filter(e => e.type === 'expense').length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating summary', error: error.message });
  }
};
