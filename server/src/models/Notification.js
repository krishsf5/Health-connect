const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['message', 'appointment', 'report', 'general'], default: 'general' },
  title: { type: String, trim: true },
  body: { type: String, trim: true },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
