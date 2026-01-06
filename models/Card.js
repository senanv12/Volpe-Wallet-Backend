const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Bu kartın hansı istifadəçiyə aid olduğunu bildirir
  },
  cardNumber: { type: String, required: true },
  cardHolder: { type: String, required: true },
  expiry: { type: String, required: true },
  cvv: { type: String, required: true },
  balance: { type: Number, default: 0 }, // Kartın balansı
  cardType: { type: String, default: 'default' }, // kapital, leobank, abb və s.
  theme: { type: String, default: 'dark' } // Kartın rəngi/teması
}, {
  timestamps: true
});

module.exports = mongoose.model('Card', cardSchema);