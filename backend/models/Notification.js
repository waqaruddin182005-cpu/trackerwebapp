const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String }, // optional URL for notification
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // expense ID or alert ID
  relatedModel: { type: String, enum: ['Expense', 'Alert', 'Budget'] }, // which model it relates to
}, { timestamps: true });

// Keep notifications for 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Notification', notificationSchema);
