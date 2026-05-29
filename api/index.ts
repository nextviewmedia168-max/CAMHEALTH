import express from "express";
import { GoogleGenAI } from "@google/genai";
import * as googleTTS from "google-tts-api";

const app = express();
app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// POST /api/symptoms
app.post(["/api/symptoms", "/symptoms"], async (req, res) => {
  let reqLanguage = 'en';
  try {
    const { text, history, language } = req.body;
    if (language) reqLanguage = language;
    
    const systemInstruction = `You are a helpful AI health assistant for a mobile app in Cambodia.
The user is describing their symptoms or health concerns. Provide preliminary insights and caring advice.
Important Constraints:
- ALWAYS include a clear disclaimer that this is NOT a definitive medical diagnosis and they should consult a healthcare professional.
- The output language MUST strictly match the requested language (which is: ${reqLanguage}). If Khmer, speak fluently in Khmer.
- Be concise, supportive, and use markdown bullet points where appropriate.
- Act like a live chat agent.`;

    const chatHistory = (history || []).map((msg: any) => ({
       role: msg.role === 'user' ? 'user' : 'model',
       parts: [{ text: msg.content }]
    }));

    chatHistory.push({
       role: 'user',
       parts: [{ text }]
    });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Missing API Key", 
        result: reqLanguage === 'Khmer'
          ? "សូមអភ័យទោស តម្រូវឱ្យមានកូនសោ API (GEMINI_API_KEY) សម្រាប់ការប្រើប្រាស់។ សូមកំណត់វានៅក្នុងការកំណត់ Vercel Environment Variables របស់អ្នក។"
          : "Sorry, the GEMINI_API_KEY is missing. Please configure it in your Vercel Environment Variables."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: chatHistory,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });
    
    // Check if the response was blocked by safety settings or returned empty
    if (!response.candidates || response.candidates.length === 0) {
      return res.json({ result: reqLanguage === 'Khmer' 
        ? "សូមអភ័យទោស ខ្ញុំមិនអាចឆ្លើយតបទៅនឹងសំណួរនេះបានទេ។ សូមព្យាយាមពន្យល់បន្ថែមអំពីបញ្ហារបស់អ្នកចុះ។"
        : "I'm sorry, but I can't generate a response for that. Could you please provide more details about your symptoms?" });
    }

    let replyText = response.text || "";
    if (!replyText) {
       replyText = reqLanguage === 'Khmer' ? "សូមអភ័យទោស មានបញ្ហាក្នុងការវិភាគ។" : "Sorry, there was an issue analyzing your input.";
    }
    
    res.json({ result: replyText });
  } catch (error: any) {
    // Check for rate limit
    if (error?.status === 429 || error?.message?.includes('429')) {
       console.warn("Gemini Rate Limit Exceeded (429)");
       return res.status(429).json({ result: reqLanguage === 'Khmer' ? 'សូមអភ័យទោស ប្រព័ន្ធកំពុងមមាញឹក។ សូមព្យាយាមម្តងទៀតក្នុងរយៈពេលមួយនាទី។' : 'Sorry, the system is currently busy (Rate Limit). Please try again in a minute.' });
    }
    
    console.error("Gemini API Error:", error);
    
    res.status(500).json({ 
      error: "Failed to fetch response", 
      details: error?.message,
      result: reqLanguage === 'Khmer' 
        ? "សូមអភ័យទោស បច្ចុប្បន្នប្រព័ន្ធមានបញ្ហា។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។" 
        : "Sorry, the system encountered an error. Please try again later."
    });
  }
});

// POST /api/summarize
app.post(["/api/summarize", "/summarize"], async (req, res) => {
  let reqLanguage = 'en';
  try {
    const { history, language } = req.body;
    if (language) reqLanguage = language;
    
    const systemInstruction = `You are a helpful UI assistant.
The user wants a concise, bulleted summary of the patient's reported symptoms and timeline based ONLY on the chat history provided.
This summary is intended to be shown directly to a doctor to quickly get up to speed.
Keep it strictly factual, clear, and professional. 
Do not include any greeting or conversational filler.
Output the summary in the requested language: ${reqLanguage}.`;

    const chatHistory = (history || []).map((msg: any) => ({
       role: msg.role === 'user' ? 'user' : 'model',
       parts: [{ text: msg.content }]
    }));

    if (chatHistory.length === 0) {
       return res.json({ result: reqLanguage === 'Khmer' ? 'គ្មានរោគសញ្ញាត្រូវបានរាយការណ៍ទេ។' : 'No symptoms reported yet.' });
    }

    chatHistory.push({
       role: 'user',
       parts: [{ text: "Please generate the summary now." }]
    });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Missing API Key", 
        result: reqLanguage === 'Khmer'
          ? "សូមអភ័យទោស តម្រូវឱ្យមានកូនសោ API (GEMINI_API_KEY) សម្រាប់ការប្រើប្រាស់។ សូមកំណត់វានៅក្នុងការកំណត់ Vercel Environment Variables របស់អ្នក។"
          : "Sorry, the GEMINI_API_KEY is missing. Please configure it in your Vercel Environment Variables."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: chatHistory,
      config: {
        systemInstruction,
        temperature: 0.1
      }
    });
    
    // Check if the response was blocked by safety settings or returned empty
    if (!response.candidates || response.candidates.length === 0) {
      return res.json({ result: reqLanguage === 'Khmer' 
        ? "មិនអាចបង្កើតការសង្ខេបបានទេ។ សូមសាកល្បងម្ដងទៀត។"
        : "Could not generate summary. Please try again." });
    }

    let summaryText = response.text || "";
    if (!summaryText) {
       summaryText = reqLanguage === 'Khmer' ? "មានបញ្ហាក្នុងការបង្កើតការសង្ខេប។" : "There was an issue generating the summary.";
    }
    
    res.json({ result: summaryText });
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes('429')) {
       console.warn("Gemini Rate Limit Exceeded (429) on summarize");
       return res.status(429).json({ result: reqLanguage === 'Khmer' ? 'សូមអភ័យទោស ប្រព័ន្ធកំពុងមមាញឹក។ សូមព្យាយាមម្តងទៀតក្នុងរយៈពេលមួយនាទី។' : 'Sorry, the system is currently busy (Rate Limit). Please try again in a minute.' });
    }
    
    console.error("Gemini API Summarize Error:", error);
    
    res.status(500).json({ 
      error: "Failed to generate summary.", 
      result: reqLanguage === 'Khmer' 
        ? "មានបញ្ហាបច្ចេកទេសក្នុងការបង្កើតការសង្ខេប។" 
        : "Technical error generating summary." 
    });
  }
});

// POST /api/tts
app.post(["/api/tts", "/tts"], async (req, res) => {
   try {
     const { text, language } = req.body;
     const langCode = language === 'km' ? 'km' : 'en';
     let chunks = [];
     let currentText = text;
     while (currentText.length > 0) {
       if (currentText.length <= 150) {
         chunks.push(currentText);
         break;
       }
       let match = currentText.substring(0, 150).match(/.*[។៕,.\n]/);
       let splitIndex = match ? match[0].length : 150;
       chunks.push(currentText.substring(0, splitIndex));
       currentText = currentText.substring(splitIndex);
     }

     const audioUrls = [];
     for (const chunk of chunks) {
       const results = googleTTS.getAllAudioUrls(chunk, {
          lang: langCode,
          slow: false,
          host: 'https://translate.google.com',
          splitPunct: '។៕,.?\n',
       });
       audioUrls.push(...results.map(r => `/api/tts/proxy?url=${encodeURIComponent(r.url)}`));
     }
     res.json({ audioUrls });
   } catch (err) {
     console.error("TTS Error:", err);
     res.status(500).json({ error: "TTS generation failed" });
   }
});

app.get(['/api/tts/proxy', '/tts/proxy'], async (req, res) => {
  try {
    const targetUrl = req.query.url as string;
    if (!targetUrl) return res.status(400).send("Missing URL");
    const response = await fetch(targetUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error");
  }
});

export default app;
