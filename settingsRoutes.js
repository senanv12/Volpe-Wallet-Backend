// server/settingsRoutes.js
const express = require('express');
const axios = require('axios');
const { translate } = require('google-translate-api-x');
const NodeCache = require('node-cache');
const router = express.Router();

// Cache sistemi (Valyutanı 1 saat, Tərcüməni 24 saat yadda saxlayır)
const myCache = new NodeCache();

// --- 1. VALYUTA API (Canlı Məzənnələr) ---
router.get('/rates', async (req, res) => {
    try {
        // Cache-də varsa, oradan götür
        const cachedRates = myCache.get("rates");
        if (cachedRates) {
            return res.json(cachedRates);
        }

        // Baza valyuta olaraq AZN götürürük
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/AZN');
        const data = response.data;

        // Bizə lazım olan valyutalar
        const requiredCurrencies = ['AZN', 'TRY', 'USD', 'GBP', 'EUR', 'RUB'];
        
        let filteredRates = {};
        requiredCurrencies.forEach(curr => {
            filteredRates[curr] = data.rates[curr];
        });

        // Cache-ə yazırıq (3600 saniyə = 1 saat)
        myCache.set("rates", filteredRates, 3600);

        res.json(filteredRates);
    } catch (error) {
        console.error("Valyuta xətası:", error.message);
        // API işləməsə, standart məzənnələr qaytar
        res.json({ AZN: 1, USD: 0.59, EUR: 0.54, TRY: 18.5, GBP: 0.46, RUB: 53.0 });
    }
});

// --- 2. TƏRCÜMƏ API (Google Translate) ---

// Əsas lüğət (Baza dili: İngilis dili daha dəqiq tərcümə üçün əsas götürülür)
const baseDictionary = {

    
    // Header
    nav_cards: "Cards",
    nav_transactions: "Transactions",
    nav_calculator: "Calculator",
    btn_login: "Login",
    btn_start: "Get Started",
    // MainPage
    hero_badge: "Future Digital Wallet",
    hero_title_1: "Manage your finances smartly.",
    hero_title_2: "E-Wallet",
    hero_subtitle: "All your cards in one place. Automatic management and security.",
    btn_more: "Learn More",
    stat_balance: "Total Balance",
    stat_expenses: "Monthly Expenses",
    stat_savings: "Savings Goal",
    card_holder: "CARD HOLDER",
    card_expires: "EXPIRES",
    // Calculator
    calc_title: "Credit Calculator",
    calc_desc: "Plan your finances easily.",
    input_loan: "Loan Amount",
    input_rate: "Annual Interest Rate",
    input_term: "Loan Term (months)",
    btn_calculate: "Calculate",
    res_monthly: "Monthly Payment",
    res_total: "Total Payment",
    // Common
    welcome: "Welcome",
    loading: "Loading..."
};

router.get('/translations', async (req, res) => {
    const lang = req.query.lang || 'EN'; // Hədəf dil (AZ, RU, EN)

    // Əgər İngilis dilidirsə, birbaşa qaytar
    if (lang === 'EN') {
        return res.json(baseDictionary);
    }

    // Cache yoxla
    const cacheKey = `trans_${lang}`;
    const cachedTrans = myCache.get(cacheKey);
    if (cachedTrans) {
        return res.json(cachedTrans);
    }

    try {
        console.log(`Tərcümə edilir: EN -> ${lang}...`);
        
        const translatedDict = {};
        const keys = Object.keys(baseDictionary);
        const values = Object.values(baseDictionary);

        // Google Translate API çağırışı (Array şəklində göndəririk ki, tez olsun)
        // 'auto' - avtomatik dil aşkarlama, 'to' - hədəf dil
        const result = await translate(values, { from: 'en', to: lang.toLowerCase() });

        // Nəticələri obyektə yığırıq
        keys.forEach((key, index) => {
            // result.text array və ya tək string ola bilər
            translatedDict[key] = Array.isArray(result) ? result[index].text : result.text;
        });

        // Cache-ə yaz (24 saat)
        myCache.set(cacheKey, translatedDict, 86400);

        res.json(translatedDict);

    } catch (error) {
        console.error("Tərcümə xətası:", error);
        // Xəta olsa baza lüğəti qaytar
        res.json(baseDictionary);
    }
});

module.exports = router;