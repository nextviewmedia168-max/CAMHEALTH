import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "hi",
    });
    console.log("Success:", !!response.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
