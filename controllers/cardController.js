const Card = require('../models/Card');

// ==========================================
// 1. KARTLARI GƏTİR (GET)
// ==========================================
// @route   GET /api/cards
// @access  Private (Token tələb olunur)
const getCards = async (req, res) => {
  try {
    // Yalnız daxil olmuş istifadəçiyə aid kartları tap
    const cards = await Card.find({ user: req.user.id });
    res.status(200).json(cards);
  } catch (error) {
    console.error("Kartları gətirərkən xəta:", error);
    res.status(500).json({ message: 'Server xətası: Kartlar yüklənmədi' });
  }
};

// ==========================================
// 2. YENİ KART ƏLAVƏ ET (POST)
// ==========================================
// @route   POST /api/cards
// @access  Private
const addCard = async (req, res) => {
  const { cardNumber, cardHolder, expiry, cvv, cardType, balance } = req.body;

  // 1. Məlumatların doluluğunu yoxla
  if (!cardNumber || !cardHolder || !expiry || !cvv) {
    return res.status(400).json({ message: 'Zəhmət olmasa bütün sahələri doldurun' });
  }

  try {
    // 2. Eyni nömrəli kartın olub-olmadığını yoxla (Opsional)
    const cardExists = await Card.findOne({ cardNumber });
    if (cardExists) {
      return res.status(400).json({ message: 'Bu kart artıq sistemdə mövcuddur' });
    }

    // 3. Yeni kart yarat
    const card = await Card.create({
      user: req.user.id, // Kartı cari istifadəçiyə bağlayırıq
      cardNumber,
      cardHolder,
      expiry,
      cvv,
      cardType: cardType || 'default', // Əgər tip seçilməyibsə 'default' olsun
      balance: balance ? Number(balance) : 0 // Balans yoxdursa 0 olsun
    });

    res.status(201).json(card);
  } catch (error) {
    console.error("Kart əlavə edilərkən xəta:", error);
    res.status(400).json({ message: 'Kart əlavə edilə bilmədi', error: error.message });
  }
};

// ==========================================
// 3. KARTI SİL (DELETE)
// ==========================================
// @route   DELETE /api/cards/:id
// @access  Private
const deleteCard = async (req, res) => {
  try {
    // 1. Kartı ID-sinə görə tap
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Kart tapılmadı' });
    }

    // 2. TƏHLÜKƏSİZLİK: Kartı silən adam onun sahibidirmi?
    // Card modelində istifadəçi sahəsi 'user' adlanır.
    if (card.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu kartı silməyə icazəniz yoxdur' });
    }

    // 3. Kartı bazadan sil
    await Card.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Kart uğurla silindi', id: req.params.id });
  } catch (error) {
    console.error("Kart silinərkən xəta:", error);
    res.status(500).json({ message: 'Server xətası baş verdi' });
  }
};

// Funksiyaları ixrac edirik
module.exports = {
  getCards,
  addCard,
  deleteCard
};