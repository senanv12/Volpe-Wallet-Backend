const { GoogleGenerativeAI } = require("@google/generative-ai");

// .env faylından API açarını götürürük
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getAIChatResponse = async (req, res) => {
  const { message, history } = req.body;

  try {
    // --- DÜZƏLİŞ: Sizin curl əmrinizdəki model adı ---
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", // Əgər bu da işləməsə, "gemini-2.0-flash-exp" yoxlayın
      systemInstruction: "Sən Volpe AI-san. Azərbaycan dilində qısa, səmimi və maliyyə mövzularında köməksevər cavablar ver."
    });
    // -------------------------------------------------

    // 1. Tarixçəni formatlayırıq
    let chatHistory = (history || []).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // 2. Gemini Tələbi: Tarixçə mütləq 'user' ilə başlamalıdır.
    // Əgər ilk mesaj modeldən gəlirsə (salamlama), onu silirik.
    if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
        chatHistory.shift(); 
    }

    // 3. Söhbət sessiyasını başladırıq
    const chat = model.startChat({
      history: chatHistory,
    });

    // 4. Mesajı göndəririk
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("AI Xətası:", error);
    
    // Xətanı daha detallı qaytarırıq ki, səbəbini görə bilək
    res.status(500).json({ 
      reply: "Sistemdə xəta baş verdi.",
      error: error.message,
      model: "gemini-2.0-flash" 
    });
  }
};