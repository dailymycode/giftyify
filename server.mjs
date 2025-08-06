import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'client'))); //client+

if (!process.env.API_KEY) {
  console.error("❌ API_KEY .env dosyasında bulunamadı!");
  process.exit(1);
}


const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/api/gemini', async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt boş olamaz.' });
  }

  try {
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

   
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini API başarılı yanıt aldı');
    res.json({ text });
  } catch (err) {
    console.error('❌ Gemini API hatası:', err);
    // Provide more helpful error messages
    let errorMessage = 'AI cevabı alınamadı.';
    if (err.message.includes('API_KEY')) {
      errorMessage = 'API anahtarı geçersiz. Lütfen .env dosyasındaki API_KEY değerini kontrol edin.';
    } else if (err.message.includes('quota')) {
      errorMessage = 'API kotası aşıldı. Lütfen daha sonra tekrar deneyin.';
    }
    res.status(500).json({ error: errorMessage, details: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
});
