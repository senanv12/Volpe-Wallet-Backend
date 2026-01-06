const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const locales = require('./data/locales');
const settingsRoutes = require('./settingsRoutes'); // Addım 1-dəki fayl
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// --- ROUTES ---
app.use('/api', require('./routes/authRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/friends', require('./routes/friendRoutes')); 
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api', settingsRoutes);
// AI Routu silindi

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda işləyir...`));


app.get('/api/translations', (req, res) => {
    const lang = req.query.lang || 'AZ'; // Dil seçilməyibsə AZ götür
    
    const translationData = locales[lang];
    
    if (translationData) {
        res.json(translationData);
    } else {
        // Əgər səhv dil gəlibsə AZ qaytar
        res.json(locales['AZ']);
    }
});