const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware'); //
const { protect } = require('../middleware/authMiddleware');


// Controller funksiyaları mövcuddurmu?
if (!transactionController.transferMoney) console.error("XƏTA: transferMoney tapılmadı");

router.post('/transfer', protect, transactionController.transferMoney);
router.get('/', protect, transactionController.getTransactions);

module.exports = router;