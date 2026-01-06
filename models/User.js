const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: { // YENİ: Axtarış üçün unikal ad
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  walletBalance: { // YENİ: Daxili pulqabı balansı
    type: Number,
    default: 50.00 // Qeydiyyat bonusu kimi 50 AZN verək
  },

  avatar: {
    type: String,
    default: "" // Boşdursa baş hərfini götürəcəyik
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
});


// Şifrəni hash-ləmək
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Şifrəni yoxlamaq
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);