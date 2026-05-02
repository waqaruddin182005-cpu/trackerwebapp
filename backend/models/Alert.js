const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['budget_warning', 'budget_critical', 'daily_reminder', 'monthly_bill', 'spending_alert'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String }, // for category-specific alerts
  amount: { type: Number }, // threshold amount
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String }, // URL to take action on alert
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // when alert becomes inactive
}, { timestamps: true });

// Automatically delete read alerts after 30 days
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Alert', alertSchema);
