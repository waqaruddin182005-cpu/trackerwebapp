const jsPDF = require('jspdf');
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
    const pageHeight = doc.internal.pageSize.getHeight();
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
    doc.text(`Total Income: ₹${totalIncome.toFixed(2)}`, 20, yPosition + 8);
    doc.text(`Total Expenses: ₹${totalExpense.toFixed(2)}`, 20, yPosition + 16);
    doc.text(`Net Savings: ₹${totalSavings.toFixed(2)}`, 20, yPosition + 24);

    yPosition += 40;

    // Table header
    doc.setFontSize(10);
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
    doc.text('Date', 20, yPosition + 6);
    doc.text('Category', 50, yPosition + 6);
    doc.text('Type', 100, yPosition + 6);
    doc.text('Amount', 130, yPosition + 6);
    doc.text('Description', 160, yPosition + 6);

    yPosition += 10;

    // Table rows
    doc.setFontSize(9);
    expenses.forEach((expense, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 10;
      }

      const dateStr = new Date(expense.date).toLocaleDateString('en-IN');
      const typeStr = expense.type === 'income' ? 'Income' : 'Expense';
      const amountStr = `₹${expense.amount.toFixed(2)}`;
      const description = expense.description || '-';

      doc.setTextColor(0);
      doc.text(dateStr, 20, yPosition);
      doc.text(expense.category, 50, yPosition);
      doc.text(typeStr, 100, yPosition);
      doc.text(amountStr, 130, yPosition);
      doc.text(description.substring(0, 30), 160, yPosition);

      yPosition += 8;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.pages.length}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );

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
