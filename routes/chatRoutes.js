const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getChatUsers, getConversation } = require('../controllers/chatController');

router.post('/send', protect, sendMessage);
router.get('/users', protect, getChatUsers);
router.get('/conversation/:userId', protect, getConversation);
module.exports = router;