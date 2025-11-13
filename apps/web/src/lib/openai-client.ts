/**
 * AI Client with AI Gateway Support
 * 
 * Uses free AI providers first (Gemini), with easy upgrade to premium later.
 * Automatically routes through Vercel AI Gateway if configured.
 */

import OpenAI from 'openai';

/**
 * Free AI models (no cost)
 */
export const FREE_MODELS = {
  gemini: 'google/gemini-flash', // Best free option: 15 req/min, 1M tokens/day
  geminiPro: 'google/gemini-pro', // Alternative free option
} as const;

/**
 * Premium AI models (pay-per-use)
 */
export const PREMIUM_MODELS = {
  openai: 'openai/gpt-4o-mini', // Cheapest paid: ~$0.15/1M tokens
  claude: 'anthropic/claude-3-haiku', // Good balance: ~$0.25/1M tokens
  grok: 'xai/grok-beta', // Alternative
} as const;

/**
 * Get the model to use based on environment
 * - FREE mode: Uses Gemini (free tier)
 * - PREMIUM mode: Uses OpenAI (when monetized)
 */
export function getAIModel(): string {
  // If PREMIUM_AI is enabled, use premium model
  if (process.env.USE_PREMIUM_AI === 'true') {
    return PREMIUM_MODELS.openai; // Start with cheapest paid option
  }
  
  // Default: Use free Gemini
  return FREE_MODELS.gemini;
}

/**
 * Creates an OpenAI-compatible client that routes through AI Gateway
 * Works with any OpenAI-compatible API (Gemini, Claude, etc.)
 */
export function createAIClient(): OpenAI {
  // For free models (Gemini), we still need an API key for AI Gateway
  // But the model itself is free
  const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('AI_GATEWAY_API_KEY or OPENAI_API_KEY must be configured');
  }

  const config = {
    apiKey,
    // Always use AI Gateway if available (it routes to free providers)
    baseURL: 'https://ai-gateway.vercel.sh/v1',
  } as const;

  return new OpenAI(config);
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use createAIClient() instead
 */
export function createOpenAIClient(): OpenAI {
  return createAIClient();
}

