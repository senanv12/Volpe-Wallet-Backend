const mongoose = require('mongoose');
module.exports = mongoose.model('Notification', new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true }, // 'friend_req', 'transfer', 'message'
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true }));