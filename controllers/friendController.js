const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const Notification = require('../models/Notification');

exports.sendFriendRequest = async (req, res) => {
  // Frontend-dən gələn məlumatı dəqiqləşdiririk
  const { recipientId } = req.body;
  const senderId = req.user.id;

  if (!recipientId) {
    return res.status(400).json({ message: "İstifadəçi ID-si göndərilməyib (recipientId is missing)" });
  }

  try {
    // 1. Özünə dostluq ata bilməz
    if (senderId === recipientId) {
        return res.status(400).json({ message: "Özünüzə dostluq ata bilməzsiniz" });
    }

    // 2. Artıq sorğu varmı?
    const existing = await FriendRequest.findOne({ 
        sender: senderId, 
        recipient: recipientId, 
        status: 'pending' 
    });
    if (existing) return res.status(400).json({ message: "Sorğu artıq göndərilib" });

    // 3. YARATMA (Mongoose-a düzgün adla ötürürük: 'recipient')
    await FriendRequest.create({
      sender: senderId,
      recipient: recipientId // <--- BURASI VACİBDİR
    });

    // 4. Bildiriş
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: 'friend_req',
      message: `${req.user.name} sizə dostluq sorğusu göndərdi.`
    });

    res.status(200).json({ message: "Dostluq sorğusu göndərildi" });

  } catch (error) {
    console.error("Friend Error:", error);
    res.status(500).json({ message: error.message });
  }
};