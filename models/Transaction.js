const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Göndərən
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Qəbul edən (əgər daxili köçürmədirsə)
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card', // Əgər kartla edilibsə
    required: false
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer'], // Transfer əlavə etdik
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);