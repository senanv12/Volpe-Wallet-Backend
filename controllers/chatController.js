const Message = require('../models/Message');
const User = require('../models/User');

// Mesaj Göndər
exports.sendMessage = async (req, res) => {
  const { recipientId, text } = req.body;
  
  if (!recipientId || !text) return res.status(400).json({ message: "Məlumat çatışmır" });

  try {
    const msg = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      text
    });
    // Mesajı yaradandan sonra dərhal populate edirik
    const populatedMsg = await Message.findById(msg._id).populate('sender', 'name avatar');
    
    res.status(201).json(populatedMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Söhbəti Gətir (Mesajlar)
exports.getConversation = async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: userId },
        { sender: userId, recipient: req.user.id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name avatar');

    res.json(messages || []); 
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};

// İstifadəçiləri Gətir (Siyahı üçün - ƏSAS DÜZƏLİŞ BURADADIR)
exports.getChatUsers = async (req, res) => {
    try {
        // Mənim iştirak etdiyim bütün mesajları tap
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { recipient: req.user.id }]
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'name username avatar')
        .populate('recipient', 'name username avatar');

        const usersMap = new Map();

        messages.forEach(msg => {
            if (!msg.sender || !msg.recipient) return;

            // Məntiq: Mən senderəmsə -> Recipienti götür. Mən Recipientəmsə -> Senderi götür.
            const isMeSender = msg.sender._id.toString() === req.user.id.toString();
            const otherUser = isMeSender ? msg.recipient : msg.sender;

            // Özümüzü siyahıya salmayaq (Ehtiyat üçün)
            if (otherUser._id.toString() === req.user.id.toString()) return;

            if (!usersMap.has(otherUser._id.toString())) {
                usersMap.set(otherUser._id.toString(), {
                    _id: otherUser._id,
                    name: otherUser.name,
                    username: otherUser.username,
                    avatar: otherUser.avatar,
                    lastMessage: msg.text
                });
            }
        });

        const users = Array.from(usersMap.values());
        res.json(users);
    } catch (error) {
        console.error("Chat Users Error:", error);
        res.status(500).json({ message: error.message });
    }
};