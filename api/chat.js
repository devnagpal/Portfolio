import { generateResponse } from './_lib/AiService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Pass processing entirely to the agnostic AI Service layer
    const responseText = await generateResponse(message, history);

    return res.status(200).json({ response: responseText });

  } catch (error) {
    console.error('Conversational AI Error:', error);
    // Explicitly return a safe error code so the frontend handles it gracefully
    // No sensitive error details, stack traces, or keys are exposed to the client
    return res.status(500).json({ error: 'Failed to process AI request or provider not configured.' });
  }
}
