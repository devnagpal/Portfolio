import { generateResponse } from './_lib/AiService.js';
import { checkRateLimit } from './_lib/rateLimiter.js';
import { AI_CONFIG } from './_lib/config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let { message, history } = req.body;

    // 1. Cost Protection: Validate and trim message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    message = message.trim();
    if (message.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    
    if (message.length > AI_CONFIG.maxInputCharacters) {
      return res.status(400).json({ error: 'Message exceeds character limit' });
    }

    // 2. Cost Protection: Limit history sent to the model
    let trimmedHistory = Array.isArray(history) ? history : [];
    if (trimmedHistory.length > AI_CONFIG.maxHistoryMessages) {
      // Keep only the most recent messages (slice from the end)
      trimmedHistory = trimmedHistory.slice(-AI_CONFIG.maxHistoryMessages);
    }

    // 3. Privacy/Identifier: Get Vercel connecting IP
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.headers['x-real-ip'] || 'anonymous');

    // 4. Rate Limiting: Enforce strict backend limit
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      // Return 429 Too Many Requests
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // 5. Pass processing entirely to the agnostic AI Service layer
    const responseText = await generateResponse(message, trimmedHistory);

    return res.status(200).json({ response: responseText });

  } catch (error) {
    console.error('Conversational AI Error:', error);
    // Explicitly return a safe error code so the frontend handles it gracefully
    // No sensitive error details, stack traces, or keys are exposed to the client
    return res.status(500).json({ error: 'Failed to process AI request or provider not configured.' });
  }
}
