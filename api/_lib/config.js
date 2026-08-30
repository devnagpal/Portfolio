export const AI_CONFIG = {
  // Configurable AI Provider (e.g., 'google', 'openai', 'anthropic')
  provider: process.env.AI_PROVIDER || 'google',
  
  // Configurable Model
  model: process.env.AI_MODEL || 'gemini-2.5-flash',
  
  // API Key (Aggnostic variable names preferred, falls back to GEMINI specific for backwards compat)
  apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
  
  // Model generation parameters
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
};
