const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendFriendRequest } = require('../controllers/friendController');

router.post('/request', protect, sendFriendRequest); // POST /api/friends/request
module.exports = router;