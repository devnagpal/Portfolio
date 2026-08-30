/**
 * OpenRouter AI Provider Implementation
 * Uses standard native fetch to communicate with OpenRouter's OpenAI-compatible endpoint.
 */
export async function generateWithOpenRouter(message, history, systemInstruction, config) {
  // Construct standard OpenAI-compatible message array
  const messages = [
    { role: 'system', content: systemInstruction }
  ];

  // Append history
  if (history && Array.isArray(history)) {
    history.forEach(msg => {
      // Map roles (usually 'user' or 'assistant')
      const role = msg.role === 'assistant' ? 'assistant' : 'user';
      messages.push({ role, content: msg.content });
    });
  }

  // Append current user message
  messages.push({ role: 'user', content: message });

  // Call OpenRouter API
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'HTTP-Referer': 'https://portfolio-stage3.local', // Required by OpenRouter for ranking
      'X-Title': 'Stage 3 Personal Portfolio', // Optional identifier
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages,
      temperature: config.temperature,
      max_tokens: config.maxOutputTokens,
      // CRITICAL: We deliberately omit 'route' or 'fallbacks' arrays here.
      // This guarantees that if the free model fails, it completely fails gracefully
      // rather than silently falling back to a paid model and generating unexpected costs.
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API Error:', response.status, errorText);
    throw new Error(`OpenRouter API failed with status: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No completion choices returned from OpenRouter');
  }

  return data.choices[0].message.content;
}
