export const AI_CONFIG = {
  // Configurable AI Provider (e.g., 'google', 'openai', 'anthropic', 'openrouter')
  provider: process.env.AI_PROVIDER || 'openrouter',
  
  // Configurable Model (Defaulting to a 100% free model on OpenRouter)
  model: process.env.AI_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
  
  // API Key (Agnostic variable names preferred)
  apiKey: process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || '',
  
  // Model generation parameters
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS || '300', 10),
  
  // Cost Protection & Validation
  maxInputCharacters: parseInt(process.env.AI_MAX_INPUT_CHARS || '300', 10),
  maxHistoryMessages: parseInt(process.env.AI_MAX_HISTORY || '10', 10),
  
  // Rate Limiting Config
  // Redis credentials required if using Upstash
  redisUrl: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  redisToken: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
  
  // Limit 1: Short-term burst (e.g. 3 requests per 10m)
  burstLimit: parseInt(process.env.RL_BURST_LIMIT || '3', 10),
  burstWindow: process.env.RL_BURST_WINDOW || '10 m',
  
  // Limit 2: Long-term daily (e.g. 10 requests per 24h)
  dailyLimit: parseInt(process.env.RL_DAILY_LIMIT || '10', 10),
  dailyWindow: process.env.RL_DAILY_WINDOW || '24 h'
};
