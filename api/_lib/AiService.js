import { AI_CONFIG } from './config.js';
import { buildSystemPrompt } from './promptBuilder.js';
import { generateWithGoogle } from './providers/google.js';

/**
 * Core AI Service Abstraction Layer
 * Routes conversational requests to the configured provider.
 */
export async function generateResponse(userMessage, history) {
  if (!AI_CONFIG.apiKey) {
    throw new Error('AI Provider API Key is not configured in the environment.');
  }

  // Generate the highly restricted, personal knowledge base prompt
  const systemInstruction = buildSystemPrompt();

  switch (AI_CONFIG.provider) {
    case 'google':
      return await generateWithGoogle(userMessage, history, systemInstruction, AI_CONFIG);
      
    case 'openai':
      // return await generateWithOpenAI(userMessage, history, systemInstruction, AI_CONFIG);
      throw new Error('OpenAI provider architecture exists but SDK is not yet implemented.');
      
    case 'anthropic':
      // return await generateWithAnthropic(userMessage, history, systemInstruction, AI_CONFIG);
      throw new Error('Anthropic provider architecture exists but SDK is not yet implemented.');
      
    default:
      throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`);
  }
}
