const express = require('express');
const router = express.Router();

// Controller-dən lazım olan bütün funksiyaları BİR DƏFƏ çağırırıq
const { 
  registerUser, 
  loginUser, 
  searchUsers, 
  updateProfile 
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// --- ROUTLAR ---

// Qeydiyyat
router.post('/signup', registerUser);

// Giriş
router.post('/login', loginUser);

// İstifadəçi axtarışı (Token tələb edir)
router.get('/users/search', protect, searchUsers);

// Profil Yeniləmə (Avatar və Ad - Token tələb edir)
router.put('/update-profile', protect, updateProfile);

module.exports = router;