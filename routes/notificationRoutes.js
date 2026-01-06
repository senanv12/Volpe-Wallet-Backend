const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

router.get('/', protect, async (req, res) => {
    const notifs = await Notification.find({ recipient: req.user.id }).sort({createdAt: -1});
    res.json(notifs);
});
router.put('/:id/read', protect, async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
});
module.exports = router;