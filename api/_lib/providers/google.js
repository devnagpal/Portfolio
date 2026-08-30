import { GoogleGenAI } from '@google/genai';

/**
 * Google Gemini Provider Implementation
 */
export async function generateWithGoogle(message, history, systemInstruction, config) {
  // Lazy initialize SDK only when this specific provider is invoked
  const ai = new GoogleGenAI({ apiKey: config.apiKey });

  // Map the generic conversational history to Gemini's specific role format
  const formattedHistory = history ? history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  })) : [];

  const response = await ai.models.generateContent({
    model: config.model,
    contents: [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: systemInstruction,
      temperature: config.temperature,
    }
  });

  return response.text;
}
