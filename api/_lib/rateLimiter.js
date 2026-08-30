import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { AI_CONFIG } from './config.js';

let redis = null;
let burstLimiter = null;
let dailyLimiter = null;

// Lazy initialization of Redis and Rate Limiters
function initLimiters() {
  if (!AI_CONFIG.redisUrl || !AI_CONFIG.redisToken) {
    return false; // Not configured, fail gracefully or skip
  }
  
  if (!redis) {
    redis = new Redis({
      url: AI_CONFIG.redisUrl,
      token: AI_CONFIG.redisToken,
    });

    burstLimiter = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(AI_CONFIG.burstLimit, AI_CONFIG.burstWindow),
      prefix: '@upstash/ratelimit/burst',
    });

    dailyLimiter = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(AI_CONFIG.dailyLimit, AI_CONFIG.dailyWindow),
      prefix: '@upstash/ratelimit/daily',
    });
  }
  return true;
}

/**
 * Checks the visitor's IP against both burst and daily limits.
 * @param {string} ip - The connecting visitor's IP address
 * @returns {Promise<{ allowed: boolean, remaining: number, reset: number }>}
 */
export async function checkRateLimit(ip) {
  // If Redis is not configured, we allow the request to pass to the AI Service 
  // (which will reject if there's no API key anyway)
  if (!initLimiters()) {
    return { allowed: true };
  }

  // Use a fallback identifier if IP is somehow missing
  const identifier = ip || 'anonymous';

  // Check Daily Limit First
  const dailyResult = await dailyLimiter.limit(identifier);
  if (!dailyResult.success) {
    return { 
      allowed: false, 
      remaining: dailyResult.remaining, 
      reset: dailyResult.reset 
    };
  }

  // Check Burst Limit
  const burstResult = await burstLimiter.limit(identifier);
  if (!burstResult.success) {
    return { 
      allowed: false, 
      remaining: burstResult.remaining, 
      reset: burstResult.reset 
    };
  }

  return { allowed: true };
}
