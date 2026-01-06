const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Card = require('../models/Card');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// ======================================================
// 1. PUL KÖÇÜRMƏ (TRANSFER)
// ======================================================
exports.transferMoney = async (req, res) => {
  try {
    const { receiverUsername, amount, sources } = req.body;
    const sender = req.user; 

    // --- 1. SENDER YOXLAMASI ---
    if (!sender) return res.status(401).json({ message: 'Sessiya bitib.' });
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Məbləğ düzgün deyil.' });
    if (!sources || !Array.isArray(sources) || sources.length === 0) {
        return res.status(400).json({ message: 'Kart seçilməyib.' });
    }

    // --- 2. RECEIVER YOXLAMASI ---
    const receiver = await User.findOne({ username: receiverUsername });
    if (!receiver) return res.status(404).json({ message: 'Qəbul edən tapılmadı.' });
    if (sender._id.toString() === receiver._id.toString()) {
        return res.status(400).json({ message: 'Özünüzə pul göndərə bilməzsiniz.' });
    }

    // --- 3. KART ƏMƏLİYYATLARI ---
    let totalDeducted = 0;

    for (const source of sources) {
        const card = await Card.findById(source.cardId);
        
        if (!card) {
            throw new Error(`Kart tapılmadı (ID: ${source.cardId})`);
        }

        // --- DEBUG HİSSƏSİ: ID-ləri yoxlayırıq ---
        // Card.js modelində sahə adı 'user'-dir.
        const cardOwnerId = card.user ? card.user.toString() : 'Yoxdur';
        const currentUserId = sender._id.toString();

        console.log(`\n--- YOXLAMA ---`);
        console.log(`Kart: ${card.cardNumber}`);
        console.log(`Kartın Sahibi (DB): ${cardOwnerId}`);
        console.log(`Cari İstifadəçi (Siz): ${currentUserId}`);
        console.log(`----------------\n`);

        if (cardOwnerId !== currentUserId) {
            // Əgər ID-lər fərqlidirsə, deməli bu kart köhnə userdə qalıb.
            // Amma yenə də xətanı yumşaldırıq (Test üçün)
            throw new Error(`'${card.cardNumber.slice(-4)}' sonluqlu kart sizə aid deyil (Köhnə hesabdan qalmış ola bilər). Zəhmət olmasa kartı silib yenidən əlavə edin.`);
        }
        
        const deductVal = Number(source.deductAmount);
        
        if (card.balance < deductVal) {
            throw new Error(`${card.bankName || 'Kart'} balansında vəsait çatmır.`);
        }

        // Balansdan çıx
        card.balance -= deductVal;
        await card.save();
        
        totalDeducted += deductVal;
    }

    // --- YEKUN ---
    if (Math.abs(totalDeducted - Number(amount)) > 0.01) {
        throw new Error('Sistem xətası: Məbləğ uyğunsuzluğu.');
    }

    // Qəbul edənə əlavə et
    receiver.walletBalance += Number(amount);
    await receiver.save();

    // Tarixçə
    const transaction = await Transaction.create({
      user: sender._id,
      recipient: receiver._id,
      amount: amount,
      type: 'transfer',
      category: 'Köçürmə',
      description: `@${receiver.username} istifadəçisinə`
    });

    // Mesaj
    await Message.create({
        sender: sender._id,
        recipient: receiver._id,
        text: `💸 Sizə ${amount} ₼ köçürdüm.`,
        read: false
    });

    // Bildiriş
    await Notification.create({
        recipient: receiver._id,
        sender: sender._id,
        type: 'transfer',
        message: `${sender.name} sizə ${amount} ₼ göndərdi!`,
        read: false
    });

    res.status(200).json({ 
        success: true, 
        message: 'Transfer uğurla tamamlandı', 
        transaction 
    });

  } catch (error) {
    console.error("Transfer Xətası:", error.message);
    res.status(500).json({ message: error.message || 'Server xətası' });
  }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ user: req.user._id }, { recipient: req.user._id }]
        })
        .sort({ createdAt: -1 })
        .populate('user', 'name username')
        .populate('recipient', 'name username');

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Tarixçə yüklənmədi' });
    }
};

exports.addTransaction = async (req, res) => {
    res.status(501).json({message: "Manual add not implemented in this version"});
};