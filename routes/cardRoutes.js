const express = require('express');
const router = express.Router();
const { getCards, addCard, deleteCard } = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

// Debugging (Xəta varsa terminalda göstərəcək)
if (!getCards) console.error("XƏTA: getCards funksiyası tapılmadı! cardController.js faylını yoxlayın.");
if (!addCard) console.error("XƏTA: addCard funksiyası tapılmadı! cardController.js faylını yoxlayın.");
if (!protect) console.error("XƏTA: protect funksiyası tapılmadı! authMiddleware.js faylını yoxlayın.");

router.route('/')
  .get(protect, getCards)
  .post(protect, addCard);

router.route('/:id')
  .delete(protect, deleteCard);

module.exports = router;